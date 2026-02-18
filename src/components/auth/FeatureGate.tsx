import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import type { PlanFeatures } from '@/config/plans';

interface FeatureGateProps {
  feature: keyof PlanFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { hasFeature } = useSubscription();
  const navigate = useNavigate();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const featureLabels: Record<keyof PlanFeatures, string> = {
    analytics: 'Analytics & Reports',
    coachIntegration: 'Coach App Integration',
    customBranding: 'Custom Branding',
    prioritySupport: 'Priority Support',
    locationAnalysis: 'Location Analysis',
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-8 text-center space-y-4">
        <div className="p-4 rounded-full bg-muted w-fit mx-auto">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{featureLabels[feature]}</h3>
            <Badge variant="secondary">Premium</Badge>
          </div>
          <p className="text-muted-foreground">
            Upgrade your plan to unlock {featureLabels[feature].toLowerCase()}.
          </p>
        </div>
        <Button onClick={() => navigate('/pricing')}>
          Upgrade Plan
        </Button>
      </CardContent>
    </Card>
  );
}
