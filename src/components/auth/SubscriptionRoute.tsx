import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CreditCard, AlertTriangle, XCircle } from 'lucide-react';

interface SubscriptionRouteProps {
  children: React.ReactNode;
}

export default function SubscriptionRoute({ children }: SubscriptionRouteProps) {
  const { loading: authLoading, isDemoMode, user } = useAuth();
  const { subscription, loading: subLoading, isActive } = useSubscription();
  const navigate = useNavigate();

  // Demo mode or internal team accounts bypass subscription checks
  if (isDemoMode || user?.email?.endsWith('@prometheus.coach')) {
    return <>{children}</>;
  }

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading subscription...</p>
        </div>
      </div>
    );
  }

  // Active subscription: allow access
  if (isActive) {
    return <>{children}</>;
  }

  // No subscription at all
  if (!subscription || subscription.status === 'none') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full glass-card">
          <CardContent className="p-8 text-center space-y-6">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
              <CreditCard className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground">
                Select a plan to start managing your studio with Prometheus.
              </p>
            </div>
            <Button className="w-full" size="lg" onClick={() => navigate('/pricing')}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Past due / unpaid
  if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full glass-card">
          <CardContent className="p-8 text-center space-y-6">
            <div className="p-4 rounded-full bg-yellow-500/10 w-fit mx-auto">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Payment Issue</h2>
              <p className="text-muted-foreground">
                Your subscription payment failed. Please update your payment method to continue.
              </p>
            </div>
            <Button className="w-full" size="lg" onClick={() => navigate('/settings?tab=billing')}>
              Update Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Canceled
  if (subscription.status === 'canceled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full glass-card">
          <CardContent className="p-8 text-center space-y-6">
            <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Subscription Ended</h2>
              <p className="text-muted-foreground">
                Your subscription has been canceled. Resubscribe to access your studio.
              </p>
            </div>
            <Button className="w-full" size="lg" onClick={() => navigate('/pricing')}>
              Choose a Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full glass-card">
        <CardContent className="p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold">Subscription Required</h2>
          <Button className="w-full" size="lg" onClick={() => navigate('/pricing')}>
            View Plans
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
