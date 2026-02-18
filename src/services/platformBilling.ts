import { supabase } from '@/lib/supabase';
import type { PlatformSubscription } from '@/types/database';
import { TRIAL_DURATION_DAYS } from '@/config/plans';
import type { PlanId } from '@/config/plans';

export interface PlatformBillingService {
  getSubscription(gymId: string): Promise<PlatformSubscription | null>;
  createCheckoutSession(priceId: string, planId: PlanId): Promise<string>;
  createPortalSession(): Promise<string>;
  startTrial(gymId: string, ownerId: string): Promise<PlatformSubscription>;
}

export const platformBillingService: PlatformBillingService = {
  async getSubscription(gymId: string): Promise<PlatformSubscription | null> {
    const { data, error } = await supabase
      .from('platform_subscriptions')
      .select('*')
      .eq('gym_id', gymId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async createCheckoutSession(priceId: string, planId: PlanId): Promise<string> {
    const { data, error } = await supabase.functions.invoke('platform-create-checkout', {
      body: {
        priceId,
        planId,
        successUrl: `${window.location.origin}/settings?tab=billing&status=success`,
        cancelUrl: `${window.location.origin}/pricing?status=canceled`,
      },
    });

    if (error) throw error;
    return data.url;
  },

  async createPortalSession(): Promise<string> {
    const { data, error } = await supabase.functions.invoke('platform-create-portal', {
      body: {
        returnUrl: `${window.location.origin}/settings?tab=billing`,
      },
    });

    if (error) throw error;
    return data.url;
  },

  async startTrial(gymId: string, ownerId: string): Promise<PlatformSubscription> {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('platform_subscriptions')
      .upsert({
        gym_id: gymId,
        owner_id: ownerId,
        plan_id: 'trial',
        status: 'trialing',
        trial_start: now.toISOString(),
        trial_end: trialEnd.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: trialEnd.toISOString(),
      }, {
        onConflict: 'gym_id',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
