import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CHART_COLORS } from '@/lib/chartConstants';
import type { CompetitorData } from '@/services/locationDemoData';

interface PricingPositionChartProps {
  competitors: CompetitorData[];
  gymPrice: number;
  gymMembers: number;
}

export default function PricingPositionChart({
  competitors,
  gymPrice,
  gymMembers,
}: PricingPositionChartProps) {
  const gymPoint = {
    name: 'Your Gym',
    monthly_price: gymPrice,
    estimated_members: gymMembers,
    isGym: true,
  };

  const competitorPoints = competitors.map(c => ({
    name: c.name,
    monthly_price: c.monthly_price,
    estimated_members: c.estimated_members,
    isGym: false,
  }));

  const allPoints = [gymPoint, ...competitorPoints];

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            dataKey="monthly_price"
            name="Monthly Price"
            unit=" CHF"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            label={{
              value: 'Monthly Price (CHF)',
              position: 'insideBottom',
              offset: -5,
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 12,
            }}
          />
          <YAxis
            type="number"
            dataKey="estimated_members"
            name="Members"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            label={{
              value: 'Estimated Members',
              angle: -90,
              position: 'insideLeft',
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => [
              name === 'Monthly Price'
                ? `CHF ${value}`
                : value.toLocaleString(),
              name,
            ]}
            labelFormatter={(_label: string, payload: Array<{ payload?: { name?: string } }>) => {
              if (payload?.[0]?.payload?.name) return payload[0].payload.name;
              return '';
            }}
          />
          <Scatter data={allPoints} fill={CHART_COLORS[1]}>
            {allPoints.map((point, index) => (
              <Cell
                key={`cell-${index}`}
                fill={point.isGym ? 'hsl(23, 87%, 55%)' : CHART_COLORS[(index % (CHART_COLORS.length - 1)) + 1]}
                r={point.isGym ? 10 : 7}
                strokeWidth={point.isGym ? 3 : 1}
                stroke={point.isGym ? 'white' : 'transparent'}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
