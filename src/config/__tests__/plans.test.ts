import {
  PLANS,
  PLAN_LIST,
  PAID_PLANS,
  getPlanById,
  hasFeature,
  getMemberLimit,
  getStaffLimit,
  formatPlanPrice,
  TRIAL_DURATION_DAYS,
} from '@/config/plans';
import type { PlanId, PlanFeatures } from '@/config/plans';

describe('plans config', () => {
  describe('PLAN_LIST', () => {
    it('has 4 entries', () => {
      expect(PLAN_LIST).toHaveLength(4);
    });

    it('includes trial, basic, premium, and vip in order', () => {
      expect(PLAN_LIST.map(p => p.id)).toEqual(['trial', 'basic', 'premium', 'vip']);
    });
  });

  describe('PAID_PLANS', () => {
    it('has 3 entries (no trial)', () => {
      expect(PAID_PLANS).toHaveLength(3);
    });

    it('does not include trial', () => {
      expect(PAID_PLANS.find(p => p.id === 'trial')).toBeUndefined();
    });

    it('includes basic, premium, and vip', () => {
      expect(PAID_PLANS.map(p => p.id)).toEqual(['basic', 'premium', 'vip']);
    });
  });

  describe('TRIAL_DURATION_DAYS', () => {
    it('is 14 days', () => {
      expect(TRIAL_DURATION_DAYS).toBe(14);
    });
  });

  describe('getPlanById', () => {
    it.each<PlanId>(['trial', 'basic', 'premium', 'vip'])('returns the correct plan for "%s"', (id) => {
      const plan = getPlanById(id);
      expect(plan).toBeDefined();
      expect(plan.id).toBe(id);
      expect(plan).toBe(PLANS[id]);
    });

    it('returns the trial plan with price 0', () => {
      const trial = getPlanById('trial');
      expect(trial.price).toBe(0);
      expect(trial.name).toBe('Trial');
    });

    it('returns the vip plan with unlimited members and staff', () => {
      const vip = getPlanById('vip');
      expect(vip.memberLimit).toBe(0);
      expect(vip.staffLimit).toBe(0);
    });
  });

  describe('hasFeature', () => {
    const allFeatures: (keyof PlanFeatures)[] = [
      'analytics',
      'coachIntegration',
      'customBranding',
      'prioritySupport',
      'locationAnalysis',
    ];

    it('VIP has all features enabled', () => {
      for (const feature of allFeatures) {
        expect(hasFeature('vip', feature)).toBe(true);
      }
    });

    it('basic has all features disabled', () => {
      for (const feature of allFeatures) {
        expect(hasFeature('basic', feature)).toBe(false);
      }
    });

    it('premium has analytics and coachIntegration enabled', () => {
      expect(hasFeature('premium', 'analytics')).toBe(true);
      expect(hasFeature('premium', 'coachIntegration')).toBe(true);
    });

    it('premium has customBranding, prioritySupport, and locationAnalysis disabled', () => {
      expect(hasFeature('premium', 'customBranding')).toBe(false);
      expect(hasFeature('premium', 'prioritySupport')).toBe(false);
      expect(hasFeature('premium', 'locationAnalysis')).toBe(false);
    });

    it('trial has analytics, coachIntegration, customBranding, locationAnalysis enabled but not prioritySupport', () => {
      expect(hasFeature('trial', 'analytics')).toBe(true);
      expect(hasFeature('trial', 'coachIntegration')).toBe(true);
      expect(hasFeature('trial', 'customBranding')).toBe(true);
      expect(hasFeature('trial', 'locationAnalysis')).toBe(true);
      expect(hasFeature('trial', 'prioritySupport')).toBe(false);
    });
  });

  describe('getMemberLimit', () => {
    it('returns 100 for basic', () => {
      expect(getMemberLimit('basic')).toBe(100);
    });

    it('returns 500 for premium', () => {
      expect(getMemberLimit('premium')).toBe(500);
    });

    it('returns 0 (unlimited) for vip', () => {
      expect(getMemberLimit('vip')).toBe(0);
    });

    it('returns 100 for trial', () => {
      expect(getMemberLimit('trial')).toBe(100);
    });
  });

  describe('getStaffLimit', () => {
    it('returns 3 for basic', () => {
      expect(getStaffLimit('basic')).toBe(3);
    });

    it('returns 10 for premium', () => {
      expect(getStaffLimit('premium')).toBe(10);
    });

    it('returns 0 (unlimited) for vip', () => {
      expect(getStaffLimit('vip')).toBe(0);
    });

    it('returns 3 for trial', () => {
      expect(getStaffLimit('trial')).toBe(3);
    });
  });

  describe('formatPlanPrice', () => {
    it('returns "Free" for trial (price=0)', () => {
      expect(formatPlanPrice(PLANS.trial)).toBe('Free');
    });

    it('returns "$49/mo" for basic', () => {
      expect(formatPlanPrice(PLANS.basic)).toBe('$49/mo');
    });

    it('returns "$89/mo" for premium', () => {
      expect(formatPlanPrice(PLANS.premium)).toBe('$89/mo');
    });

    it('returns "$149/mo" for vip', () => {
      expect(formatPlanPrice(PLANS.vip)).toBe('$149/mo');
    });
  });

  describe('plan definitions', () => {
    it('premium is marked as popular', () => {
      expect(PLANS.premium.popular).toBe(true);
    });

    it('other plans are not marked as popular', () => {
      expect(PLANS.trial.popular).toBeFalsy();
      expect(PLANS.basic.popular).toBeFalsy();
      expect(PLANS.vip.popular).toBeFalsy();
    });

    it('each plan has a non-empty description', () => {
      for (const plan of PLAN_LIST) {
        expect(plan.description).toBeTruthy();
        expect(typeof plan.description).toBe('string');
      }
    });

    it('each paid plan has a stripePriceId', () => {
      for (const plan of PAID_PLANS) {
        expect(plan.stripePriceId).toBeTruthy();
      }
    });

    it('trial has an empty stripePriceId', () => {
      expect(PLANS.trial.stripePriceId).toBe('');
    });
  });
});
