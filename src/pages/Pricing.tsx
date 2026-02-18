import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Zap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { platformBilling } from '@/services/platformBillingService';
import { PAID_PLANS, type PlanDefinition } from '@/config/plans';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (plan: PlanDefinition) => {
    if (!user) {
      navigate('/auth/register');
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const url = await platformBilling.createCheckoutSession(plan.stripePriceId, plan.id);
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to create checkout session');
    } finally {
      setLoadingPlan(null);
    }
  };

  const featureList = (plan: PlanDefinition): string[] => {
    const base = [
      `Up to ${plan.memberLimit === 0 ? 'Unlimited' : plan.memberLimit} members`,
      `Up to ${plan.staffLimit === 0 ? 'Unlimited' : plan.staffLimit} staff members`,
      'Member CRM',
      'Session Calendar',
      'Financial Overview',
      'Access Control',
    ];

    if (plan.features.analytics) base.push('Analytics & Reports');
    if (plan.features.coachIntegration) base.push('Coach App Integration');
    if (plan.features.customBranding) base.push('Custom Branding');
    if (plan.features.prioritySupport) base.push('Priority Support');

    return base;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Back button */}
        {user && (
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Prometheus Enterprise</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your studio. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {PAID_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative glass-card hover:scale-[1.02] transition-transform ${
                plan.popular ? 'border-primary border-2' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {featureList(plan).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loadingPlan === plan.id}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Start Free Trial'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ / Trust signals */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>14-day free trial on all plans. No credit card required to start.</p>
          <p>Cancel anytime. Upgrade or downgrade as you grow.</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
