import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/chartConstants';
import type { PLZData } from '@/services/locationDemoData';

interface MemberDistributionChartProps {
  plzData: PLZData[];
}

export default function MemberDistributionChart({ plzData }: MemberDistributionChartProps) {
  const top15 = [...plzData]
    .sort((a, b) => b.members - a.members)
    .slice(0, 15)
    .map(p => ({
      label: `${p.plz} ${p.name}`,
      members: p.members,
      penetration: (p.penetration * 100).toFixed(2),
    }));

  return (
    <div className="h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={top15}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            width={115}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, _name: string, props: { payload: { penetration: string } }) => [
              `${value} members (${props.payload.penetration}% penetration)`,
              'Members',
            ]}
          />
          <Bar
            dataKey="members"
            fill={CHART_COLORS[0]}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
