import { screen, fireEvent } from '@testing-library/react';
import { render } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Component that throws on render
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal Content</div>;
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress console.error output from React's error boundary logging
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Safe Content')).toBeInTheDocument();
  });

  it('catches error and shows fallback UI with "Something went wrong"', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Normal Content')).not.toBeInTheDocument();
  });

  it('resets error state and re-renders children when "Try Again" is clicked', () => {
    // Use a stateful wrapper to control whether the child throws
    let shouldThrow = true;
    function ConditionalThrower() {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Recovered Content</div>;
    }

    render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Fix the error condition before clicking Try Again
    shouldThrow = false;
    fireEvent.click(screen.getByText('Try Again'));

    expect(screen.getByText('Recovered Content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('uses custom fallback prop when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error Page</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom Error Page')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('calls console.error via componentDidCatch when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    // React itself calls console.error, and our componentDidCatch also calls it
    // Check that console.error was called with our specific prefix
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught:',
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it('navigates to /dashboard when Dashboard button is clicked', () => {
    const originalLocation = window.location;
    // @ts-expect-error jsdom allows deleting window.location
    delete window.location;
    window.location = { ...originalLocation, href: '' } as Location;

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByText('Dashboard'));

    expect(window.location.href).toBe('/dashboard');

    // Restore
    window.location = originalLocation;
  });
});
