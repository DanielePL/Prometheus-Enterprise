import { supabase } from '@/lib/supabase';
import type { StripeSubscription, StripeAccountStatus } from '@/types/database';

export interface StripeConnectionStatus {
  isConnected: boolean;
  accountId: string | null;
  connectedAt: string | null;
  status: StripeAccountStatus;
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
  clientSecret: string;
}

export interface CreatePaymentResult {
  paymentIntentId: string;
  clientSecret: string;
}

export const stripeService = {
  /**
   * Get Stripe connection status for a gym
   */
  async getConnectionStatus(gymId: string): Promise<StripeConnectionStatus> {
    const { data, error } = await supabase
      .from('gyms')
      .select('stripe_account_id, stripe_connected_at, stripe_account_status')
      .eq('id', gymId)
      .single();

    if (error) throw error;

    return {
      isConnected: data.stripe_account_status === 'connected',
      accountId: data.stripe_account_id,
      connectedAt: data.stripe_connected_at,
      status: data.stripe_account_status || 'disconnected',
    };
  },

  /**
   * Initiate Stripe Connect OAuth flow
   * Returns the URL to redirect the user to
   */
  async initiateConnect(): Promise<string> {
    const { data, error } = await supabase.functions.invoke('stripe-connect-oauth');
    if (error) throw error;
    return data.url;
  },

  /**
   * Disconnect Stripe account from gym
   */
  async disconnect(gymId: string): Promise<void> {
    const { error } = await supabase
      .from('gyms')
      .update({
        stripe_account_id: null,
        stripe_connected_at: null,
        stripe_account_status: 'disconnected',
      })
      .eq('id', gymId);

    if (error) throw error;
  },

  /**
   * Create a subscription for a member
   */
  async createSubscription(
    memberId: string,
    priceId: string
  ): Promise<CreateSubscriptionResult> {
    const { data, error } = await supabase.functions.invoke('stripe-create-subscription', {
      body: { memberId, priceId },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelImmediately = false
  ): Promise<void> {
    const { error } = await supabase.functions.invoke('stripe-cancel-subscription', {
      body: { subscriptionId, cancelImmediately },
    });
    if (error) throw error;
  },

  /**
   * Get all subscriptions for a member
   */
  async getMemberSubscriptions(memberId: string): Promise<StripeSubscription[]> {
    const { data, error } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all subscriptions for a gym
   */
  async getGymSubscriptions(gymId: string): Promise<StripeSubscription[]> {
    const { data, error } = await supabase
      .from('stripe_subscriptions')
      .select(`
        *,
        member:members(id, name, email, avatar_url)
      `)
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a one-time payment for a member
   */
  async createPayment(
    memberId: string,
    amount: number,
    description: string
  ): Promise<CreatePaymentResult> {
    const { data, error } = await supabase.functions.invoke('stripe-create-payment', {
      body: { memberId, amount, description },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Get Stripe Express dashboard login link
   */
  async getDashboardLink(gymId: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('stripe-dashboard-link', {
      body: { gymId },
    });
    if (error) throw error;
    return data.url;
  },

  /**
   * Sync subscription status from Stripe
   */
  async syncSubscription(subscriptionId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('stripe-sync-subscription', {
      body: { subscriptionId },
    });
    if (error) throw error;
  },
};
