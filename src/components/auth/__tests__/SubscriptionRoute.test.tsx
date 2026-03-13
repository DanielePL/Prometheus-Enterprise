import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render-helper';
import SubscriptionRoute from '@/components/auth/SubscriptionRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/contexts/SubscriptionContext', () => ({
  useSubscription: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseSubscription = vi.mocked(useSubscription);

function defaultAuthReturn(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  return {
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
    ...overrides,
  };
}

function defaultSubscriptionReturn(overrides: Partial<ReturnType<typeof useSubscription>> = {}) {
  return {
    subscription: null,
    loading: false,
    isActive: false,
    isTrialing: false,
    planId: 'trial' as const,
    trialDaysRemaining: 0,
    memberLimit: 100,
    staffLimit: 3,
    hasFeature: vi.fn(() => false),
    refetch: vi.fn(),
    ...overrides,
  };
}

describe('SubscriptionRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bypasses subscription checks and renders children in demo mode', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn({ isDemoMode: true }));
    mockUseSubscription.mockReturnValue(defaultSubscriptionReturn());

    renderWithProviders(
      <SubscriptionRoute>
        <div>App Content</div>
      </SubscriptionRoute>,
    );

    expect(screen.getByText('App Content')).toBeInTheDocument();
  });

  it('shows loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn({ loading: true }));
    mockUseSubscription.mockReturnValue(defaultSubscriptionReturn());

    renderWithProviders(
      <SubscriptionRoute>
        <div>App Content</div>
      </SubscriptionRoute>,
    );

    expect(screen.getByText('Loading subscription...')).toBeInTheDocument();
    expect(screen.queryByText('App Content')).not.toBeInTheDocument();
  });

  it('shows loading spinner when subscription is loading', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn());
    mockUseSubscription.mockReturnValue(defaultSubscriptionReturn({ loading: true }));

    renderWithProviders(
      <SubscriptionRoute>
        <div>App Content</div>
      </SubscriptionRoute>,
    );

    expect(screen.getByText('Loading subscription...')).toBeInTheDocument();
    expect(screen.queryByText('App Content')).not.toBeInTheDocument();
  });

  it('renders children when subscription is active', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn());
    mockUseSubscription.mockReturnValue(
      defaultSubscriptionReturn({
        isActive: true,
        subscription: { status: 'active', plan_id: 'premium' } as any,
      }),
    );

    renderWithProviders(
      <SubscriptionRoute>
        <div>App Content</div>
      </SubscriptionRoute>,
    );

    expect(screen.getByText('App Content')).toBeInTheDocument();
  });

  it('shows "Choose Your Plan" when there is no subscription', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn());
    mockUseSubscription.mockReturnValue(
      defaultSubscriptionReturn({
        subscription: null,
        isActive: false,
      }),
    );

    renderWithProviders(
      <SubscriptionRoute>
        <div>App Content</div>
      </SubscriptionRoute>,
    );

    expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
    expect(screen.getByText('View Plans')).toBeInTheDocument();
    expect(screen.queryByText('App Content')).not.toBeInTheDocument();
  });

  it('shows "Choose Your Plan" when subscription status is none', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn());
    mockUseSubscription.mockReturnValue(
      defaultSubscriptionReturn({
        subscription: { status: 'none' } as any,
        isActive: false,
      }),
    );

    renderWithProviders(
      <SubscriptionRoute>
        <div>App Content</div>
      </SubscriptionRoute>,
    );

    expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
  });

  it('shows "Payment Issue" when subscription is past_due', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn());
    mockUseSubscription.mockReturnValue(
      defaultSubscriptionReturn({
        subscription: { status: 'past_due' } as any,
        isActive: false,
      }),
    );

    renderWithProviders(
      <SubscriptionRoute>
        <div>App Content</div>
      </SubscriptionRoute>,
    );

    expect(screen.getByText('Payment Issue')).toBeInTheDocument();
    expect(screen.getByText('Update Payment')).toBeInTheDocument();
    expect(screen.queryByText('App Content')).not.toBeInTheDocument();
  });

  it('shows "Payment Issue" when subscription is unpaid', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn());
    mockUseSubscription.mockReturnValue(
      defaultSubscriptionReturn({
        subscription: { status: 'unpaid' } as any,
        isActive: false,
      }),
    );

    renderWithProviders(
      <SubscriptionRoute>
        <div>App Content</div>
      </SubscriptionRoute>,
    );

    expect(screen.getByText('Payment Issue')).toBeInTheDocument();
  });

  it('shows "Subscription Ended" when subscription is canceled', () => {
    mockUseAuth.mockReturnValue(defaultAuthReturn());
    mockUseSubscription.mockReturnValue(
      defaultSubscriptionReturn({
        subscription: { status: 'canceled' } as any,
        isActive: false,
      }),
    );

    renderWithProviders(
      <SubscriptionRoute>
        <div>App Content</div>
      </SubscriptionRoute>,
    );

    expect(screen.getByText('Subscription Ended')).toBeInTheDocument();
    expect(screen.getByText('Choose a Plan')).toBeInTheDocument();
    expect(screen.queryByText('App Content')).not.toBeInTheDocument();
  });
});
