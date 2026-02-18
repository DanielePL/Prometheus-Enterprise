import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { platformBilling } from '@/services/platformBillingService';
import type { PlatformSubscription, PlatformPlanId } from '@/types/database';
import { PLANS, type PlanFeatures } from '@/config/plans';

interface SubscriptionContextType {
  subscription: PlatformSubscription | null;
  loading: boolean;
  isActive: boolean;
  isTrialing: boolean;
  planId: PlatformPlanId;
  trialDaysRemaining: number;
  memberLimit: number;
  staffLimit: number;
  hasFeature: (feature: keyof PlanFeatures) => boolean;
  refetch: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Demo subscription for demo mode
const DEMO_SUBSCRIPTION: PlatformSubscription = {
  id: 'demo-sub',
  gym_id: 'demo-gym-id',
  owner_id: 'demo-user-id',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  plan_id: 'vip',
  status: 'active',
  current_period_start: new Date().toISOString(),
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancel_at_period_end: false,
  trial_start: null,
  trial_end: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { gym, isDemoMode, user } = useAuth();

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['platform-subscription', gym?.id],
    queryFn: () => platformBilling.getSubscription(gym!.id),
    enabled: !!gym?.id && !isDemoMode,
    staleTime: 60000,
  });

  const activeSub = isDemoMode ? DEMO_SUBSCRIPTION : (subscription ?? null);
  const status = activeSub?.status;
  const planId = (activeSub?.plan_id ?? 'trial') as PlatformPlanId;
  const plan = PLANS[planId] || PLANS.trial;

  const isActive = status === 'active' || status === 'trialing';
  const isTrialing = status === 'trialing';

  const trialDaysRemaining = (() => {
    if (!isTrialing || !activeSub?.trial_end) return 0;
    const end = new Date(activeSub.trial_end).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  })();

  const memberLimit = plan.memberLimit;
  const staffLimit = plan.staffLimit;

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    return plan.features[feature] ?? false;
  };

  const value: SubscriptionContextType = {
    subscription: activeSub,
    loading: isLoading && !isDemoMode,
    isActive,
    isTrialing,
    planId,
    trialDaysRemaining,
    memberLimit,
    staffLimit,
    hasFeature,
    refetch,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
