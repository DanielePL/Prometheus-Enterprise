import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CHART_COLORS } from '@/lib/chartConstants';
import type { DistanceSegment } from '@/services/locationDemoData';

interface DistanceDistributionChartProps {
  data: DistanceSegment[];
}

export default function DistanceDistributionChart({ data }: DistanceDistributionChartProps) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="members"
            nameKey="range"
            label={({ range, pct }) => `${range} (${pct}%)`}
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, _name: string, props: { payload: DistanceSegment }) => [
              `${value} members (${props.payload.pct}%)`,
              props.payload.range,
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
