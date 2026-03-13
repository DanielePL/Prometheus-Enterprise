import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render-helper';
import FeatureGate from '@/components/auth/FeatureGate';
import { useSubscription } from '@/contexts/SubscriptionContext';

vi.mock('@/contexts/SubscriptionContext', () => ({
  useSubscription: vi.fn(),
}));

const mockUseSubscription = vi.mocked(useSubscription);

describe('FeatureGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when feature is available', () => {
    mockUseSubscription.mockReturnValue({
      subscription: null,
      loading: false,
      isActive: true,
      isTrialing: false,
      planId: 'premium',
      trialDaysRemaining: 0,
      memberLimit: 500,
      staffLimit: 10,
      hasFeature: vi.fn((feature) => feature === 'analytics'),
      refetch: vi.fn(),
    });

    renderWithProviders(
      <FeatureGate feature="analytics">
        <div>Analytics Dashboard</div>
      </FeatureGate>,
    );

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('shows locked UI with upgrade button when feature is not available', () => {
    mockUseSubscription.mockReturnValue({
      subscription: null,
      loading: false,
      isActive: true,
      isTrialing: false,
      planId: 'basic',
      trialDaysRemaining: 0,
      memberLimit: 100,
      staffLimit: 3,
      hasFeature: vi.fn(() => false),
      refetch: vi.fn(),
    });

    renderWithProviders(
      <FeatureGate feature="analytics">
        <div>Analytics Dashboard</div>
      </FeatureGate>,
    );

    expect(screen.queryByText('Analytics Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Analytics & Reports')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
    expect(screen.getByText(/upgrade your plan to unlock/i)).toBeInTheDocument();
  });

  it('renders custom fallback when feature is unavailable and fallback is provided', () => {
    mockUseSubscription.mockReturnValue({
      subscription: null,
      loading: false,
      isActive: true,
      isTrialing: false,
      planId: 'basic',
      trialDaysRemaining: 0,
      memberLimit: 100,
      staffLimit: 3,
      hasFeature: vi.fn(() => false),
      refetch: vi.fn(),
    });

    renderWithProviders(
      <FeatureGate
        feature="coachIntegration"
        fallback={<div>Custom Upgrade Message</div>}
      >
        <div>Coach Integration Panel</div>
      </FeatureGate>,
    );

    expect(screen.queryByText('Coach Integration Panel')).not.toBeInTheDocument();
    expect(screen.getByText('Custom Upgrade Message')).toBeInTheDocument();
    // Should not show the default locked UI
    expect(screen.queryByText('Upgrade Plan')).not.toBeInTheDocument();
  });

  it('shows correct label for coachIntegration feature', () => {
    mockUseSubscription.mockReturnValue({
      subscription: null,
      loading: false,
      isActive: true,
      isTrialing: false,
      planId: 'basic',
      trialDaysRemaining: 0,
      memberLimit: 100,
      staffLimit: 3,
      hasFeature: vi.fn(() => false),
      refetch: vi.fn(),
    });

    renderWithProviders(
      <FeatureGate feature="coachIntegration">
        <div>Coach Panel</div>
      </FeatureGate>,
    );

    expect(screen.getByText('Coach App Integration')).toBeInTheDocument();
  });

  it('shows correct label for customBranding feature', () => {
    mockUseSubscription.mockReturnValue({
      subscription: null,
      loading: false,
      isActive: true,
      isTrialing: false,
      planId: 'basic',
      trialDaysRemaining: 0,
      memberLimit: 100,
      staffLimit: 3,
      hasFeature: vi.fn(() => false),
      refetch: vi.fn(),
    });

    renderWithProviders(
      <FeatureGate feature="customBranding">
        <div>Branding Settings</div>
      </FeatureGate>,
    );

    expect(screen.getByText('Custom Branding')).toBeInTheDocument();
  });
});
