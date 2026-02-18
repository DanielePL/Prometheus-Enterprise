import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Clock,
  Users,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { platformBilling } from '@/services/platformBillingService';
import { membersService } from '@/services/members';
import { coachesService } from '@/services/coaches';
import { PLANS } from '@/config/plans';
import { format } from 'date-fns';

export default function BillingSettings() {
  const { gym } = useAuth();
  const { subscription, isActive, isTrialing, planId, trialDaysRemaining, memberLimit, staffLimit } = useSubscription();
  const navigate = useNavigate();
  const [portalLoading, setPortalLoading] = useState(false);

  const plan = PLANS[planId];

  // Fetch current counts for usage display
  const { data: members = [] } = useQuery({
    queryKey: ['members', gym?.id],
    queryFn: () => membersService.getAll(gym!.id),
    enabled: !!gym?.id,
  });

  const { data: coaches = [] } = useQuery({
    queryKey: ['coaches', gym?.id],
    queryFn: () => coachesService.getAll(gym!.id),
    enabled: !!gym?.id,
  });

  const memberCount = members.length;
  const staffCount = coaches.length;
  const memberUsage = memberLimit > 0 ? Math.round((memberCount / memberLimit) * 100) : 0;
  const staffUsage = staffLimit > 0 ? Math.round((staffCount / staffLimit) * 100) : 0;

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      const url = await platformBilling.createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!subscription) return <Badge variant="outline">No Plan</Badge>;

    switch (subscription.status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500">Trial ({trialDaysRemaining} days left)</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      default:
        return <Badge variant="outline">{subscription.status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Plan */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{plan?.name || 'No Plan'}</h3>
              <p className="text-muted-foreground">{plan?.description}</p>
            </div>
            <div className="text-right">
              {getStatusBadge()}
              {plan?.price > 0 && (
                <p className="text-lg font-semibold mt-1">${plan.price}/mo</p>
              )}
            </div>
          </div>

          {/* Trial warning */}
          {isTrialing && trialDaysRemaining <= 3 && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
              <div>
                <p className="font-medium text-yellow-500">Trial ending soon</p>
                <p className="text-sm text-muted-foreground">
                  Your trial ends in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}.
                  Choose a plan to continue using Prometheus.
                </p>
              </div>
            </div>
          )}

          {/* Period info */}
          {subscription?.current_period_end && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {subscription.cancel_at_period_end
                ? `Cancels on ${format(new Date(subscription.current_period_end), 'MMM d, yyyy')}`
                : `Renews on ${format(new Date(subscription.current_period_end), 'MMM d, yyyy')}`
              }
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {isActive && subscription?.stripe_subscription_id && (
              <Button variant="outline" onClick={handleOpenPortal} disabled={portalLoading}>
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/pricing')}>
              {isActive ? 'Change Plan' : 'View Plans'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Members */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Members</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {memberCount} / {memberLimit === 0 ? 'Unlimited' : memberLimit}
              </span>
            </div>
            {memberLimit > 0 && (
              <Progress
                value={memberUsage}
                className={`h-2 ${memberUsage >= 90 ? '[&>div]:bg-destructive' : ''}`}
              />
            )}
          </div>

          {/* Staff */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Staff / Coaches</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {staffCount} / {staffLimit === 0 ? 'Unlimited' : staffLimit}
              </span>
            </div>
            {staffLimit > 0 && (
              <Progress
                value={staffUsage}
                className={`h-2 ${staffUsage >= 90 ? '[&>div]:bg-destructive' : ''}`}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
