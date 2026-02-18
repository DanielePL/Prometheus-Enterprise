import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function ROICalculator() {
  const [investment, setInvestment] = useState(400000);
  const [monthlyRent, setMonthlyRent] = useState(6000);
  const [areaSqm, setAreaSqm] = useState(500);
  const [pricePerMember, setPricePerMember] = useState(95);
  const [estimatedMembers, setEstimatedMembers] = useState(160);
  const [churnRate, setChurnRate] = useState(5);

  const calculations = useMemo(() => {
    const monthlyRevenue = pricePerMember * estimatedMembers;
    const staffCost = estimatedMembers > 200 ? 12000 : 8000;
    const utilityCost = areaSqm * 3;
    const monthlyCosts = monthlyRent + staffCost + utilityCost;
    const monthlyProfit = monthlyRevenue - monthlyCosts;
    const breakEvenMonths =
      monthlyProfit > 0 ? Math.ceil(investment / monthlyProfit) : Infinity;
    const threeYearRevenue = monthlyRevenue * 36;
    const threeYearCosts = monthlyCosts * 36 + investment;
    const threeYearROI =
      threeYearCosts > 0
        ? ((threeYearRevenue - threeYearCosts) / investment) * 100
        : 0;
    const monthlyChurnLoss = Math.round(
      estimatedMembers * (churnRate / 100) * pricePerMember
    );

    return {
      monthlyRevenue,
      monthlyCosts,
      monthlyProfit,
      breakEvenMonths,
      threeYearROI,
      monthlyChurnLoss,
      staffCost,
      utilityCost,
    };
  }, [investment, monthlyRent, areaSqm, pricePerMember, estimatedMembers, churnRate]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="roi-invest">Investment (CHF)</Label>
            <Input
              id="roi-invest"
              type="number"
              min="0"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roi-rent">Monthly Rent (CHF)</Label>
            <Input
              id="roi-rent"
              type="number"
              min="0"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roi-area">Area (sqm)</Label>
            <Input
              id="roi-area"
              type="number"
              min="0"
              value={areaSqm}
              onChange={(e) => setAreaSqm(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roi-price">Price/Member (CHF)</Label>
            <Input
              id="roi-price"
              type="number"
              min="0"
              value={pricePerMember}
              onChange={(e) => setPricePerMember(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roi-members">Est. Members</Label>
            <Input
              id="roi-members"
              type="number"
              min="0"
              value={estimatedMembers}
              onChange={(e) => setEstimatedMembers(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roi-churn">Churn Rate (%)</Label>
            <Input
              id="roi-churn"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={churnRate}
              onChange={(e) => setChurnRate(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              Monthly Revenue
            </div>
            <p className="text-xl font-bold text-green-500">
              CHF {calculations.monthlyRevenue.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              Monthly Costs
            </div>
            <p className="text-xl font-bold text-red-500">
              CHF {calculations.monthlyCosts.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Rent + Staff + Utilities
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Monthly Profit
            </div>
            <p
              className={`text-xl font-bold ${
                calculations.monthlyProfit >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              CHF {calculations.monthlyProfit.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5" />
              Break-even
            </div>
            <p className="text-xl font-bold">
              {calculations.breakEvenMonths === Infinity
                ? 'N/A'
                : `${calculations.breakEvenMonths} months`}
            </p>
          </div>
        </div>

        {/* ROI summary */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div>
            <p className="font-semibold">3-Year ROI</p>
            <p className="text-sm text-muted-foreground">
              After initial investment of CHF {investment.toLocaleString()}
            </p>
          </div>
          <Badge
            className={
              calculations.threeYearROI > 0
                ? 'bg-green-500 text-white text-lg px-3 py-1'
                : 'bg-red-500 text-white text-lg px-3 py-1'
            }
          >
            {calculations.threeYearROI > 0 ? '+' : ''}
            {calculations.threeYearROI.toFixed(1)}%
          </Badge>
        </div>

        {/* Churn impact */}
        {calculations.monthlyChurnLoss > 0 && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              At {churnRate}% monthly churn, you lose ~CHF{' '}
              {calculations.monthlyChurnLoss.toLocaleString()}/month in revenue.
              Plan for acquisition costs to replace{' '}
              {Math.round(estimatedMembers * (churnRate / 100))} members/month.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
