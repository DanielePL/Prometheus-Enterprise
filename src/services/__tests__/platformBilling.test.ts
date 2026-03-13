import { supabase } from '@/lib/supabase';
import { platformBillingService } from '@/services/platformBilling';
import type { MockSupabaseClient } from '@/test/supabase-mock';

const mockSupabase = supabase as unknown as MockSupabaseClient;

describe('platformBillingService', () => {
  beforeEach(() => {
    mockSupabase.__resetAll();
  });

  describe('getSubscription', () => {
    it('returns subscription data when found', async () => {
      const subscription = {
        id: 'sub-1',
        gym_id: 'gym-1',
        plan_id: 'premium',
        status: 'active',
      };

      mockSupabase.__getBuilder('platform_subscriptions').mockResult({
        data: subscription,
        error: null,
      });

      const result = await platformBillingService.getSubscription('gym-1');
      expect(result).toEqual(subscription);
      expect(mockSupabase.from).toHaveBeenCalledWith('platform_subscriptions');
    });

    it('returns null when no subscription found (PGRST116)', async () => {
      mockSupabase.__getBuilder('platform_subscriptions').mockResult({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await platformBillingService.getSubscription('gym-1');
      expect(result).toBeNull();
    });

    it('throws on non-PGRST116 errors', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' };
      mockSupabase.__getBuilder('platform_subscriptions').mockResult({
        data: null,
        error: dbError,
      });

      await expect(platformBillingService.getSubscription('gym-1')).rejects.toEqual(dbError);
    });
  });

  describe('createCheckoutSession', () => {
    it('calls functions.invoke with correct parameters and returns URL', async () => {
      const checkoutUrl = 'https://checkout.stripe.com/session-123';
      vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
        data: { url: checkoutUrl },
        error: null,
      });

      const result = await platformBillingService.createCheckoutSession('price_premium', 'premium');

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('platform-create-checkout', {
        body: expect.objectContaining({
          priceId: 'price_premium',
          planId: 'premium',
        }),
      });
      expect(result).toBe(checkoutUrl);
    });

    it('throws when functions.invoke returns an error', async () => {
      const invokeError = { message: 'Edge function failed' };
      vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
        data: null,
        error: invokeError,
      });

      await expect(
        platformBillingService.createCheckoutSession('price_premium', 'premium')
      ).rejects.toEqual(invokeError);
    });
  });

  describe('createPortalSession', () => {
    it('calls functions.invoke and returns portal URL', async () => {
      const portalUrl = 'https://billing.stripe.com/portal-456';
      vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
        data: { url: portalUrl },
        error: null,
      });

      const result = await platformBillingService.createPortalSession();

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('platform-create-portal', {
        body: expect.objectContaining({
          returnUrl: expect.stringContaining('/settings'),
        }),
      });
      expect(result).toBe(portalUrl);
    });

    it('throws when functions.invoke returns an error', async () => {
      const invokeError = { message: 'Portal creation failed' };
      vi.mocked(mockSupabase.functions.invoke).mockResolvedValue({
        data: null,
        error: invokeError,
      });

      await expect(platformBillingService.createPortalSession()).rejects.toEqual(invokeError);
    });
  });

  describe('startTrial', () => {
    it('upserts trial subscription and returns data', async () => {
      const trialSub = {
        id: 'sub-trial-1',
        gym_id: 'gym-1',
        owner_id: 'owner-1',
        plan_id: 'trial',
        status: 'trialing',
      };

      mockSupabase.__getBuilder('platform_subscriptions').mockResult({
        data: trialSub,
        error: null,
      });

      const result = await platformBillingService.startTrial('gym-1', 'owner-1');

      expect(result).toEqual(trialSub);
      expect(mockSupabase.from).toHaveBeenCalledWith('platform_subscriptions');

      const builder = mockSupabase.__getBuilder('platform_subscriptions');
      expect(builder.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          gym_id: 'gym-1',
          owner_id: 'owner-1',
          plan_id: 'trial',
          status: 'trialing',
        }),
        { onConflict: 'gym_id' }
      );
      expect(builder.select).toHaveBeenCalled();
      expect(builder.single).toHaveBeenCalled();
    });

    it('includes trial_start, trial_end, current_period_start, current_period_end', async () => {
      mockSupabase.__getBuilder('platform_subscriptions').mockResult({
        data: { id: 'sub-1' },
        error: null,
      });

      await platformBillingService.startTrial('gym-1', 'owner-1');

      const builder = mockSupabase.__getBuilder('platform_subscriptions');
      const upsertCall = vi.mocked(builder.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];

      expect(upsertCall.trial_start).toBeDefined();
      expect(upsertCall.trial_end).toBeDefined();
      expect(upsertCall.current_period_start).toBeDefined();
      expect(upsertCall.current_period_end).toBeDefined();

      // Verify trial_end is ~14 days after trial_start
      const start = new Date(upsertCall.trial_start).getTime();
      const end = new Date(upsertCall.trial_end).getTime();
      const diffDays = (end - start) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(14);
    });

    it('throws on database error', async () => {
      const dbError = { code: '23505', message: 'Unique violation' };
      mockSupabase.__getBuilder('platform_subscriptions').mockResult({
        data: null,
        error: dbError,
      });

      await expect(platformBillingService.startTrial('gym-1', 'owner-1')).rejects.toEqual(dbError);
    });
  });
});
