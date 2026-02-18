import type { PlatformSubscription } from '@/types/database';
import type { PlatformBillingService } from './platformBilling';
import type { PlanId } from '@/config/plans';
import { TRIAL_DURATION_DAYS } from '@/config/plans';

const now = new Date();
const trialEnd = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

const MOCK_SUBSCRIPTION: PlatformSubscription = {
  id: 'mock-platform-sub-id',
  gym_id: 'demo-gym-id',
  owner_id: 'demo-user-id',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  plan_id: 'trial',
  status: 'trialing',
  current_period_start: now.toISOString(),
  current_period_end: trialEnd.toISOString(),
  cancel_at_period_end: false,
  trial_start: now.toISOString(),
  trial_end: trialEnd.toISOString(),
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};

export const mockPlatformBillingService: PlatformBillingService = {
  async getSubscription(): Promise<PlatformSubscription | null> {
    return MOCK_SUBSCRIPTION;
  },

  async createCheckoutSession(_priceId: string, _planId: PlanId): Promise<string> {
    return '#dev-mode-checkout';
  },

  async createPortalSession(): Promise<string> {
    return '#dev-mode-portal';
  },

  async startTrial(gymId: string, ownerId: string): Promise<PlatformSubscription> {
    return {
      ...MOCK_SUBSCRIPTION,
      gym_id: gymId,
      owner_id: ownerId,
    };
  },
};
