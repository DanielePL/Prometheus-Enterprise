import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/render-helper';
import { SubscriptionProvider, useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { platformBilling } from '@/services/platformBillingService';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/platformBillingService', () => ({
  platformBilling: {
    getSubscription: vi.fn(),
  },
}));

const mockUseAuth = vi.mocked(useAuth);
const mockGetSubscription = vi.mocked(platformBilling.getSubscription);

// Test consumer component that exposes subscription values
function TestConsumer() {
  const sub = useSubscription();
  return (
    <div>
      <span data-testid="active">{String(sub.isActive)}</span>
      <span data-testid="plan">{sub.planId}</span>
      <span data-testid="trialing">{String(sub.isTrialing)}</span>
      <span data-testid="loading">{String(sub.loading)}</span>
      <span data-testid="feature-analytics">{String(sub.hasFeature('analytics'))}</span>
      <span data-testid="feature-coach">{String(sub.hasFeature('coachIntegration'))}</span>
      <span data-testid="feature-branding">{String(sub.hasFeature('customBranding'))}</span>
      <span data-testid="feature-support">{String(sub.hasFeature('prioritySupport'))}</span>
      <span data-testid="trial-days">{sub.trialDaysRemaining}</span>
      <span data-testid="member-limit">{sub.memberLimit}</span>
      <span data-testid="staff-limit">{sub.staffLimit}</span>
    </div>
  );
}

function renderSubscription() {
  return renderWithProviders(
    <SubscriptionProvider>
      <TestConsumer />
    </SubscriptionProvider>,
  );
}

describe('SubscriptionContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('demo mode', () => {
    it('returns VIP subscription with all features when in demo mode', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'demo-user' } as any,
        session: null,
        profile: null,
        gym: { id: 'demo-gym' } as any,
        loading: false,
        isDemoMode: true,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        updateProfile: vi.fn(),
        demoLogin: vi.fn(),
      });

      renderSubscription();

      expect(screen.getByTestId('active')).toHaveTextContent('true');
      expect(screen.getByTestId('plan')).toHaveTextContent('vip');
      expect(screen.getByTestId('feature-analytics')).toHaveTextContent('true');
      expect(screen.getByTestId('feature-coach')).toHaveTextContent('true');
      expect(screen.getByTestId('feature-branding')).toHaveTextContent('true');
      expect(screen.getByTestId('feature-support')).toHaveTextContent('true');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('does not call platformBilling.getSubscription in demo mode', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'demo-user' } as any,
        session: null,
        profile: null,
        gym: { id: 'demo-gym' } as any,
        loading: false,
        isDemoMode: true,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        updateProfile: vi.fn(),
        demoLogin: vi.fn(),
      });

      renderSubscription();

      expect(mockGetSubscription).not.toHaveBeenCalled();
    });
  });

  describe('active subscription', () => {
    it('reflects active premium subscription with correct features', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1' } as any,
        session: null,
        profile: null,
        gym: { id: 'gym-1' } as any,
        loading: false,
        isDemoMode: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        updateProfile: vi.fn(),
        demoLogin: vi.fn(),
      });

      mockGetSubscription.mockResolvedValue({
        id: 'sub-1',
        gym_id: 'gym-1',
        owner_id: 'user-1',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        plan_id: 'premium',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        trial_start: null,
        trial_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      renderSubscription();

      await waitFor(() => {
        expect(screen.getByTestId('active')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('plan')).toHaveTextContent('premium');
      // Premium has analytics and coachIntegration but not customBranding or prioritySupport
      expect(screen.getByTestId('feature-analytics')).toHaveTextContent('true');
      expect(screen.getByTestId('feature-coach')).toHaveTextContent('true');
      expect(screen.getByTestId('feature-branding')).toHaveTextContent('false');
      expect(screen.getByTestId('feature-support')).toHaveTextContent('false');
      expect(screen.getByTestId('member-limit')).toHaveTextContent('500');
      expect(screen.getByTestId('staff-limit')).toHaveTextContent('10');
    });
  });

  describe('no subscription', () => {
    it('falls back to trial plan when no subscription exists', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1' } as any,
        session: null,
        profile: null,
        gym: { id: 'gym-1' } as any,
        loading: false,
        isDemoMode: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        updateProfile: vi.fn(),
        demoLogin: vi.fn(),
      });

      mockGetSubscription.mockResolvedValue(null);

      renderSubscription();

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('plan')).toHaveTextContent('trial');
      expect(screen.getByTestId('active')).toHaveTextContent('false');
    });
  });

  describe('trialing subscription', () => {
    it('calculates remaining trial days correctly', async () => {
      const trialEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days from now

      mockUseAuth.mockReturnValue({
        user: { id: 'user-1' } as any,
        session: null,
        profile: null,
        gym: { id: 'gym-1' } as any,
        loading: false,
        isDemoMode: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        updateProfile: vi.fn(),
        demoLogin: vi.fn(),
      });

      mockGetSubscription.mockResolvedValue({
        id: 'sub-trial',
        gym_id: 'gym-1',
        owner_id: 'user-1',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        plan_id: 'trial',
        status: 'trialing',
        current_period_start: new Date().toISOString(),
        current_period_end: trialEnd,
        cancel_at_period_end: false,
        trial_start: new Date().toISOString(),
        trial_end: trialEnd,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      renderSubscription();

      await waitFor(() => {
        expect(screen.getByTestId('active')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('trialing')).toHaveTextContent('true');
      expect(screen.getByTestId('plan')).toHaveTextContent('trial');
      // Trial days remaining should be 5 (ceiling of ~5 days)
      expect(Number(screen.getByTestId('trial-days').textContent)).toBe(5);
    });
  });
});
