import { supabase } from '@/lib/supabase';
import { alertsService } from '@/services/alerts';
import type { MockSupabaseClient } from '@/test/supabase-mock';

const mockSupabase = supabase as unknown as MockSupabaseClient;

describe('alertsService', () => {
  beforeEach(() => {
    mockSupabase.__resetAll();
  });

  describe('getAll', () => {
    it('returns alerts ordered by created_at descending', async () => {
      const alerts = [
        { id: 'alert-2', gym_id: 'gym-1', type: 'system', created_at: '2026-02-02' },
        { id: 'alert-1', gym_id: 'gym-1', type: 'new_member', created_at: '2026-02-01' },
      ];

      mockSupabase.__getBuilder('alerts').mockResult({ data: alerts, error: null });

      const result = await alertsService.getAll('gym-1');

      expect(result).toEqual(alerts);
      expect(mockSupabase.from).toHaveBeenCalledWith('alerts');
      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' };
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: dbError });

      await expect(alertsService.getAll('gym-1')).rejects.toEqual(dbError);
    });
  });

  describe('getUnread', () => {
    it('returns unread alerts with default limit', async () => {
      const unreadAlerts = [
        { id: 'alert-1', gym_id: 'gym-1', is_read: false },
      ];

      mockSupabase.__getBuilder('alerts').mockResult({ data: unreadAlerts, error: null });

      const result = await alertsService.getUnread('gym-1');

      expect(result).toEqual(unreadAlerts);
      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.eq).toHaveBeenCalledWith('is_read', false);
      expect(builder.limit).toHaveBeenCalledWith(10);
    });

    it('respects custom limit parameter', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({ data: [], error: null });

      await alertsService.getUnread('gym-1', 5);

      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.limit).toHaveBeenCalledWith(5);
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'error' };
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: dbError });

      await expect(alertsService.getUnread('gym-1')).rejects.toEqual(dbError);
    });
  });

  describe('getUnreadCount', () => {
    it('returns the count of unread alerts', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({ count: 5, error: null });

      const result = await alertsService.getUnreadCount('gym-1');

      expect(result).toBe(5);
      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.eq).toHaveBeenCalledWith('is_read', false);
    });

    it('returns 0 when count is null', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({ count: null, error: null });

      const result = await alertsService.getUnreadCount('gym-1');
      expect(result).toBe(0);
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'error' };
      mockSupabase.__getBuilder('alerts').mockResult({ count: null, error: dbError });

      await expect(alertsService.getUnreadCount('gym-1')).rejects.toEqual(dbError);
    });
  });

  describe('create', () => {
    it('inserts alert and returns the created record', async () => {
      const params = {
        gym_id: 'gym-1',
        type: 'new_member' as const,
        severity: 'info' as const,
        title: 'New member joined',
        message: 'John Doe has signed up.',
      };

      const createdAlert = { id: 'alert-new', ...params, is_read: false, created_at: '2026-02-24' };

      mockSupabase.__getBuilder('alerts').mockResult({ data: createdAlert, error: null });

      const result = await alertsService.create(params);

      expect(result).toEqual(createdAlert);
      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.insert).toHaveBeenCalledWith(params);
      expect(builder.select).toHaveBeenCalled();
      expect(builder.single).toHaveBeenCalled();
    });

    it('throws on database error', async () => {
      const dbError = { code: '23505', message: 'duplicate' };
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: dbError });

      await expect(alertsService.create({
        gym_id: 'gym-1',
        type: 'system',
        severity: 'info',
        title: 'Test',
      })).rejects.toEqual(dbError);
    });
  });

  describe('markAsRead', () => {
    it('updates is_read to true for the given alert', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: null });

      await alertsService.markAsRead('alert-1');

      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.update).toHaveBeenCalledWith({ is_read: true });
      expect(builder.eq).toHaveBeenCalledWith('id', 'alert-1');
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: dbError });

      await expect(alertsService.markAsRead('alert-1')).rejects.toEqual(dbError);
    });
  });

  describe('markAllAsRead', () => {
    it('updates all unread alerts for the gym', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: null });

      await alertsService.markAllAsRead('gym-1');

      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.update).toHaveBeenCalledWith({ is_read: true });
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.eq).toHaveBeenCalledWith('is_read', false);
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: dbError });

      await expect(alertsService.markAllAsRead('gym-1')).rejects.toEqual(dbError);
    });
  });

  describe('delete', () => {
    it('deletes alert by id', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: null });

      await alertsService.delete('alert-1');

      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith('id', 'alert-1');
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: dbError });

      await expect(alertsService.delete('alert-1')).rejects.toEqual(dbError);
    });
  });

  describe('deleteOld', () => {
    it('deletes read alerts older than specified days', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: null });

      await alertsService.deleteOld('gym-1', 30);

      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.eq).toHaveBeenCalledWith('is_read', true);
      expect(builder.lt).toHaveBeenCalledWith('created_at', expect.any(String));
    });

    it('uses default of 30 days when not specified', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: null });

      await alertsService.deleteOld('gym-1');

      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.lt).toHaveBeenCalled();
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('alerts').mockResult({ data: null, error: dbError });

      await expect(alertsService.deleteOld('gym-1', 7)).rejects.toEqual(dbError);
    });
  });

  describe('createMembershipExpiringAlert', () => {
    it('creates a critical alert when daysLeft <= 3', async () => {
      const createdAlert = {
        id: 'alert-exp',
        gym_id: 'gym-1',
        type: 'membership_expiring',
        severity: 'critical',
        title: 'Membership expiring in 2 days',
      };

      mockSupabase.__getBuilder('alerts').mockResult({ data: createdAlert, error: null });

      const result = await alertsService.createMembershipExpiringAlert('gym-1', 'Jane', 'member-1', 2);

      expect(result).toEqual(createdAlert);
      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          gym_id: 'gym-1',
          type: 'membership_expiring',
          severity: 'critical',
          related_id: 'member-1',
        })
      );
    });

    it('creates a critical alert when daysLeft is exactly 3', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({
        data: { id: 'alert-1', severity: 'critical' },
        error: null,
      });

      await alertsService.createMembershipExpiringAlert('gym-1', 'Jane', 'member-1', 3);

      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'critical' })
      );
    });

    it('creates a warning alert when daysLeft > 3', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({
        data: { id: 'alert-1', severity: 'warning' },
        error: null,
      });

      await alertsService.createMembershipExpiringAlert('gym-1', 'Jane', 'member-1', 5);

      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warning' })
      );
    });

    it('includes member name in message and action URL', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({
        data: { id: 'alert-1' },
        error: null,
      });

      await alertsService.createMembershipExpiringAlert('gym-1', 'Jane Doe', 'member-1', 5);

      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Jane Doe'),
          action_url: '/members/member-1',
        })
      );
    });
  });

  describe('createPaymentOverdueAlert', () => {
    it('always creates a critical alert', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({
        data: { id: 'alert-pay', type: 'payment_overdue', severity: 'critical' },
        error: null,
      });

      const result = await alertsService.createPaymentOverdueAlert('gym-1', 'John Doe', 'member-1', 99.99);

      expect(result).toBeDefined();
      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          gym_id: 'gym-1',
          type: 'payment_overdue',
          severity: 'critical',
          related_id: 'member-1',
        })
      );
    });

    it('includes amount formatted to 2 decimal places in message', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({
        data: { id: 'alert-1' },
        error: null,
      });

      await alertsService.createPaymentOverdueAlert('gym-1', 'John Doe', 'member-1', 99.9);

      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('99.90'),
        })
      );
    });

    it('includes action_url pointing to payments page', async () => {
      mockSupabase.__getBuilder('alerts').mockResult({
        data: { id: 'alert-1' },
        error: null,
      });

      await alertsService.createPaymentOverdueAlert('gym-1', 'John', 'member-1', 50);

      const builder = mockSupabase.__getBuilder('alerts');
      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          action_url: '/payments',
        })
      );
    });
  });
});
