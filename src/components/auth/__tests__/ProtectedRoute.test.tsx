import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render-helper';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Avoid loading the full lucide-react library in tests
vi.mock('lucide-react', () => ({
  Loader2: (props: Record<string, unknown>) => <span {...props}>spinner</span>,
}));

const mockUseAuth = vi.mocked(useAuth);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      profile: null,
      gym: null,
      loading: true,
      isDemoMode: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      updateProfile: vi.fn(),
      demoLogin: vi.fn(),
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /auth/login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      profile: null,
      gym: null,
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

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    // Content should not be rendered; Navigate to /auth/login happens
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' } as any,
      session: {} as any,
      profile: { id: 'user-1', role: 'owner' } as any,
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

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /dashboard when user role does not match requiredRole', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' } as any,
      session: {} as any,
      profile: { id: 'user-1', role: 'staff' } as any,
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

    renderWithProviders(
      <ProtectedRoute requiredRole={['owner', 'admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>,
    );

    // Content should not be rendered; Navigate to /dashboard happens
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders children when user role matches one of the requiredRoles', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' } as any,
      session: {} as any,
      profile: { id: 'user-1', role: 'admin' } as any,
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

    renderWithProviders(
      <ProtectedRoute requiredRole={['owner', 'admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
