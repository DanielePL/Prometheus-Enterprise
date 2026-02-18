import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CHART_COLORS } from '@/lib/chartConstants';

interface MarketShareChartProps {
  competitors: { name: string; estimated_members: number }[];
  gymMembers: number;
  gymName: string;
}

export default function MarketShareChart({
  competitors,
  gymMembers,
  gymName,
}: MarketShareChartProps) {
  const chartData = [
    { name: gymName, value: gymMembers },
    ...competitors.map(c => ({ name: c.name, value: c.estimated_members })),
  ];

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  // Put the gym color first (primary orange)
  const colors = ['hsl(23, 87%, 55%)', ...CHART_COLORS.slice(1)];

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(1)}%`
            }
          >
            {chartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                strokeWidth={index === 0 ? 2 : 1}
                stroke={index === 0 ? 'hsl(23, 87%, 45%)' : undefined}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [
              `${value.toLocaleString()} members (${((value / total) * 100).toFixed(1)}%)`,
              'Market Share',
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
