import { supabase } from '@/lib/supabase';
import { isDemoMode, DEMO_ALERTS } from './demoData';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType =
  | 'membership_expiring'
  | 'payment_overdue'
  | 'coach_time_off'
  | 'low_attendance'
  | 'target_achieved'
  | 'new_member'
  | 'access_denied'
  | 'system'
  | 'custom';

export interface Alert {
  id: string;
  gym_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message?: string;
  action_url?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateAlertParams {
  gym_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message?: string;
  action_url?: string;
  related_id?: string;
}

export const alertsService = {
  async getAll(gymId: string) {
    if (isDemoMode()) {
      return DEMO_ALERTS as Alert[];
    }

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Alert[];
  },

  async getUnread(gymId: string, limit = 10) {
    if (isDemoMode()) {
      return DEMO_ALERTS.filter(a => !a.is_read).slice(0, limit) as Alert[];
    }

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('gym_id', gymId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Alert[];
  },

  async getUnreadCount(gymId: string) {
    if (isDemoMode()) {
      return DEMO_ALERTS.filter(a => !a.is_read).length;
    }

    const { count, error } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  async create(params: CreateAlertParams) {
    const { data, error } = await supabase
      .from('alerts')
      .insert(params)
      .select()
      .single();

    if (error) throw error;
    return data as Alert;
  },

  async markAsRead(alertId: string) {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) throw error;
  },

  async markAllAsRead(gymId: string) {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('gym_id', gymId)
      .eq('is_read', false);

    if (error) throw error;
  },

  async delete(alertId: string) {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId);

    if (error) throw error;
  },

  async deleteOld(gymId: string, daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('gym_id', gymId)
      .eq('is_read', true)
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;
  },

  // Helper methods to create specific alert types
  async createMembershipExpiringAlert(gymId: string, memberName: string, memberId: string, daysLeft: number) {
    return this.create({
      gym_id: gymId,
      type: 'membership_expiring',
      severity: daysLeft <= 3 ? 'critical' : 'warning',
      title: `Membership expiring in ${daysLeft} days`,
      message: `${memberName}'s membership will expire soon.`,
      action_url: `/members/${memberId}`,
      related_id: memberId,
    });
  },

  async createPaymentOverdueAlert(gymId: string, memberName: string, memberId: string, amount: number) {
    return this.create({
      gym_id: gymId,
      type: 'payment_overdue',
      severity: 'critical',
      title: 'Payment overdue',
      message: `${memberName} has an overdue payment of ${amount.toFixed(2)}.`,
      action_url: `/payments`,
      related_id: memberId,
    });
  },

  async createCoachTimeOffAlert(gymId: string, coachName: string, coachId: string, startDate: string, endDate: string) {
    return this.create({
      gym_id: gymId,
      type: 'coach_time_off',
      severity: 'info',
      title: 'Coach time-off request',
      message: `${coachName} requested time-off from ${startDate} to ${endDate}.`,
      action_url: `/coaches/${coachId}`,
      related_id: coachId,
    });
  },

  async createTargetAchievedAlert(gymId: string, targetType: string, value: string) {
    return this.create({
      gym_id: gymId,
      type: 'target_achieved',
      severity: 'info',
      title: `${targetType} target achieved!`,
      message: `You've reached ${value}. Great job!`,
    });
  },

  async createNewMemberAlert(gymId: string, memberName: string, memberId: string) {
    return this.create({
      gym_id: gymId,
      type: 'new_member',
      severity: 'info',
      title: 'New member joined',
      message: `${memberName} has signed up.`,
      action_url: `/members/${memberId}`,
      related_id: memberId,
    });
  },

  async createAccessDeniedAlert(
    gymId: string,
    memberName: string,
    memberId: string,
    reason: string,
    method: string
  ) {
    return this.create({
      gym_id: gymId,
      type: 'access_denied',
      severity: 'warning',
      title: 'Access denied',
      message: `${memberName} was denied access via ${method}. Reason: ${reason}`,
      action_url: `/access-logs`,
      related_id: memberId,
    });
  },

  // Check and create automatic alerts based on business rules
  async checkAndCreateAlerts(gymId: string) {
    if (isDemoMode()) {
      return []; // Skip in demo mode
    }

    const alerts: Promise<Alert>[] = [];

    // Check for expiring memberships (next 7 days)
    const { data: expiringMembers } = await supabase
      .from('members')
      .select('id, name, membership_end_date')
      .eq('gym_id', gymId)
      .eq('activity_status', 'active')
      .gte('membership_end_date', new Date().toISOString())
      .lte('membership_end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    if (expiringMembers) {
      for (const member of expiringMembers) {
        const daysLeft = Math.ceil(
          (new Date(member.membership_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        // Check if alert already exists
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('gym_id', gymId)
          .eq('type', 'membership_expiring')
          .eq('related_id', member.id)
          .eq('is_read', false)
          .single();

        if (!existingAlert) {
          alerts.push(this.createMembershipExpiringAlert(gymId, member.name, member.id, daysLeft));
        }
      }
    }

    // Check for overdue payments
    const { data: overduePayments } = await supabase
      .from('payments')
      .select('id, amount, member_id, member:members(id, name)')
      .eq('gym_id', gymId)
      .eq('status', 'overdue');

    if (overduePayments) {
      for (const payment of overduePayments) {
        const member = payment.member as { id: string; name: string } | null;
        if (!member) continue;

        // Check if alert already exists
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('gym_id', gymId)
          .eq('type', 'payment_overdue')
          .eq('related_id', member.id)
          .eq('is_read', false)
          .single();

        if (!existingAlert) {
          alerts.push(this.createPaymentOverdueAlert(gymId, member.name, member.id, payment.amount));
        }
      }
    }

    return Promise.all(alerts);
  },
};
