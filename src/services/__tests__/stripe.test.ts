import { supabase } from '@/lib/supabase';
import { stripeService } from '@/services/stripe';
import type { MockSupabaseClient } from '@/test/supabase-mock';

const mockSupabase = supabase as unknown as MockSupabaseClient;

describe('stripeService', () => {
  beforeEach(() => {
    mockSupabase.__resetAll();
  });

  describe('getConnectionStatus', () => {
    it('returns connected status when stripe_account_status is "connected"', async () => {
      mockSupabase.__getBuilder('gyms').mockResult({
        data: {
          stripe_account_id: 'acct_123',
          stripe_connected_at: '2026-01-01T00:00:00Z',
          stripe_account_status: 'connected',
        },
        error: null,
      });

      const result = await stripeService.getConnectionStatus('gym-1');

      expect(result).toEqual({
        isConnected: true,
        accountId: 'acct_123',
        connectedAt: '2026-01-01T00:00:00Z',
        status: 'connected',
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('gyms');
    });

    it('returns disconnected status when stripe_account_status is null', async () => {
      mockSupabase.__getBuilder('gyms').mockResult({
        data: {
          stripe_account_id: null,
          stripe_connected_at: null,
          stripe_account_status: null,
        },
        error: null,
      });

      const result = await stripeService.getConnectionStatus('gym-1');

      expect(result).toEqual({
        isConnected: false,
        accountId: null,
        connectedAt: null,
        status: 'disconnected',
      });
    });

    it('returns disconnected when stripe_account_status is "disconnected"', async () => {
      mockSupabase.__getBuilder('gyms').mockResult({
        data: {
          stripe_account_id: null,
          stripe_connected_at: null,
          stripe_account_status: 'disconnected',
        },
        error: null,
      });

      const result = await stripeService.getConnectionStatus('gym-1');

      expect(result.isConnected).toBe(false);
      expect(result.status).toBe('disconnected');
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' };
      mockSupabase.__getBuilder('gyms').mockResult({
        data: null,
        error: dbError,
      });

      await expect(stripeService.getConnectionStatus('gym-1')).rejects.toEqual(dbError);
    });
  });

  describe('initiateConnect', () => {
    it('calls functions.invoke and returns the OAuth URL', async () => {
      const oauthUrl = 'https://connect.stripe.com/oauth/authorize?client_id=xxx';
      vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
        data: { url: oauthUrl },
        error: null,
      });

      const result = await stripeService.initiateConnect();

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('stripe-connect-oauth');
      expect(result).toBe(oauthUrl);
    });

    it('throws when functions.invoke returns an error', async () => {
      const invokeError = { message: 'OAuth initiation failed' };
      vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
        data: null,
        error: invokeError,
      });

      await expect(stripeService.initiateConnect()).rejects.toEqual(invokeError);
    });
  });

  describe('disconnect', () => {
    it('updates gym with null stripe fields', async () => {
      mockSupabase.__getBuilder('gyms').mockResult({
        data: null,
        error: null,
      });

      await stripeService.disconnect('gym-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('gyms');
      const builder = mockSupabase.__getBuilder('gyms');
      expect(builder.update).toHaveBeenCalledWith({
        stripe_account_id: null,
        stripe_connected_at: null,
        stripe_account_status: 'disconnected',
      });
      expect(builder.eq).toHaveBeenCalledWith('id', 'gym-1');
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('gyms').mockResult({
        data: null,
        error: dbError,
      });

      await expect(stripeService.disconnect('gym-1')).rejects.toEqual(dbError);
    });
  });

  describe('createSubscription', () => {
    it('calls functions.invoke with memberId and priceId and returns result', async () => {
      const subscriptionResult = {
        subscriptionId: 'sub_123',
        clientSecret: 'pi_secret_456',
      };
      vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
        data: subscriptionResult,
        error: null,
      });

      const result = await stripeService.createSubscription('member-1', 'price_basic');

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('stripe-create-subscription', {
        body: { memberId: 'member-1', priceId: 'price_basic' },
      });
      expect(result).toEqual(subscriptionResult);
    });

    it('throws when functions.invoke returns an error', async () => {
      const invokeError = { message: 'Subscription creation failed' };
      vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
        data: null,
        error: invokeError,
      });

      await expect(stripeService.createSubscription('member-1', 'price_basic')).rejects.toEqual(invokeError);
    });
  });

  describe('cancelSubscription', () => {
    it('calls functions.invoke with subscriptionId', async () => {
      vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
        data: {},
        error: null,
      });

      await stripeService.cancelSubscription('sub_123');

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('stripe-cancel-subscription', {
        body: { subscriptionId: 'sub_123', cancelImmediately: false },
      });
    });

    it('passes cancelImmediately flag when true', async () => {
      vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
        data: {},
        error: null,
      });

      await stripeService.cancelSubscription('sub_123', true);

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('stripe-cancel-subscription', {
        body: { subscriptionId: 'sub_123', cancelImmediately: true },
      });
    });

    it('throws when functions.invoke returns an error', async () => {
      const invokeError = { message: 'Cancel failed' };
      vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
        data: null,
        error: invokeError,
      });

      await expect(stripeService.cancelSubscription('sub_123')).rejects.toEqual(invokeError);
    });
  });

  describe('getMemberSubscriptions', () => {
    it('returns subscriptions ordered by created_at', async () => {
      const subscriptions = [
        { id: 'sub-2', member_id: 'member-1', created_at: '2026-02-01' },
        { id: 'sub-1', member_id: 'member-1', created_at: '2026-01-01' },
      ];

      mockSupabase.__getBuilder('stripe_subscriptions').mockResult({
        data: subscriptions,
        error: null,
      });

      const result = await stripeService.getMemberSubscriptions('member-1');

      expect(result).toEqual(subscriptions);
      expect(mockSupabase.from).toHaveBeenCalledWith('stripe_subscriptions');
      const builder = mockSupabase.__getBuilder('stripe_subscriptions');
      expect(builder.eq).toHaveBeenCalledWith('member_id', 'member-1');
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('returns empty array when data is null', async () => {
      mockSupabase.__getBuilder('stripe_subscriptions').mockResult({
        data: null,
        error: null,
      });

      const result = await stripeService.getMemberSubscriptions('member-1');
      expect(result).toEqual([]);
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' };
      mockSupabase.__getBuilder('stripe_subscriptions').mockResult({
        data: null,
        error: dbError,
      });

      await expect(stripeService.getMemberSubscriptions('member-1')).rejects.toEqual(dbError);
    });
  });

  describe('getGymSubscriptions', () => {
    it('returns subscriptions with member join', async () => {
      const subscriptions = [
        {
          id: 'sub-1',
          gym_id: 'gym-1',
          member: { id: 'member-1', name: 'John Doe', email: 'john@test.com', avatar_url: null },
        },
      ];

      mockSupabase.__getBuilder('stripe_subscriptions').mockResult({
        data: subscriptions,
        error: null,
      });

      const result = await stripeService.getGymSubscriptions('gym-1');

      expect(result).toEqual(subscriptions);
      expect(mockSupabase.from).toHaveBeenCalledWith('stripe_subscriptions');
      const builder = mockSupabase.__getBuilder('stripe_subscriptions');
      expect(builder.select).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('returns empty array when data is null', async () => {
      mockSupabase.__getBuilder('stripe_subscriptions').mockResult({
        data: null,
        error: null,
      });

      const result = await stripeService.getGymSubscriptions('gym-1');
      expect(result).toEqual([]);
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('stripe_subscriptions').mockResult({
        data: null,
        error: dbError,
      });

      await expect(stripeService.getGymSubscriptions('gym-1')).rejects.toEqual(dbError);
    });
  });
});
