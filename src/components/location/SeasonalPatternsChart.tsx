import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';
import { CHART_COLORS } from '@/lib/chartConstants';
import type { SeasonalPattern } from '@/services/locationDemoData';

interface SeasonalPatternsChartProps {
  data: SeasonalPattern[];
}

export default function SeasonalPatternsChart({ data }: SeasonalPatternsChartProps) {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            label={{
              value: 'Members',
              angle: -90,
              position: 'insideLeft',
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 12,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            label={{
              value: 'Revenue (CHF)',
              angle: 90,
              position: 'insideRight',
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
              name === 'revenue'
                ? `CHF ${value.toLocaleString()}`
                : value.toString(),
              name === 'revenue' ? 'Revenue' : 'Members',
            ]}
          />
          <Legend />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            fill={`${CHART_COLORS[1]}30`}
            stroke={CHART_COLORS[1]}
            strokeWidth={2}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="members"
            name="Members"
            stroke={CHART_COLORS[0]}
            strokeWidth={3}
            dot={{ fill: CHART_COLORS[0], strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
