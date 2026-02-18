export type PlanId = 'trial' | 'basic' | 'premium' | 'vip';

export interface PlanFeatures {
  analytics: boolean;
  coachIntegration: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  locationAnalysis: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  price: number; // monthly in USD
  memberLimit: number; // 0 = unlimited
  staffLimit: number; // 0 = unlimited
  features: PlanFeatures;
  stripePriceId: string;
  popular?: boolean;
  description: string;
}

export const TRIAL_DURATION_DAYS = 14;

export const PLANS: Record<PlanId, PlanDefinition> = {
  trial: {
    id: 'trial',
    name: 'Trial',
    price: 0,
    memberLimit: 100,
    staffLimit: 3,
    features: {
      analytics: true,
      coachIntegration: true,
      customBranding: true,
      prioritySupport: false,
      locationAnalysis: true,
    },
    stripePriceId: '',
    description: `Free ${TRIAL_DURATION_DAYS}-day trial with all features`,
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 49,
    memberLimit: 100,
    staffLimit: 3,
    features: {
      analytics: false,
      coachIntegration: false,
      customBranding: false,
      prioritySupport: false,
      locationAnalysis: false,
    },
    stripePriceId: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID || 'price_basic_placeholder',
    description: 'Essential tools for small studios',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 89,
    memberLimit: 500,
    staffLimit: 10,
    features: {
      analytics: true,
      coachIntegration: true,
      customBranding: false,
      prioritySupport: false,
      locationAnalysis: false,
    },
    stripePriceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || 'price_premium_placeholder',
    popular: true,
    description: 'Advanced features for growing businesses',
  },
  vip: {
    id: 'vip',
    name: 'VIP',
    price: 149,
    memberLimit: 0, // unlimited
    staffLimit: 0, // unlimited
    features: {
      analytics: true,
      coachIntegration: true,
      customBranding: true,
      prioritySupport: true,
      locationAnalysis: true,
    },
    stripePriceId: import.meta.env.VITE_STRIPE_VIP_PRICE_ID || 'price_vip_placeholder',
    description: 'Everything unlimited with premium support',
  },
};

export const PLAN_LIST: PlanDefinition[] = [
  PLANS.trial,
  PLANS.basic,
  PLANS.premium,
  PLANS.vip,
];

export const PAID_PLANS: PlanDefinition[] = [
  PLANS.basic,
  PLANS.premium,
  PLANS.vip,
];

export function getPlanById(id: PlanId): PlanDefinition {
  return PLANS[id];
}

export function hasFeature(planId: PlanId, feature: keyof PlanFeatures): boolean {
  return PLANS[planId]?.features[feature] ?? false;
}

export function getMemberLimit(planId: PlanId): number {
  return PLANS[planId]?.memberLimit ?? 0;
}

export function getStaffLimit(planId: PlanId): number {
  return PLANS[planId]?.staffLimit ?? 0;
}

export function formatPlanPrice(plan: PlanDefinition): string {
  if (plan.price === 0) return 'Free';
  return `$${plan.price}/mo`;
}
