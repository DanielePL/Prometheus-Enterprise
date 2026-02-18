import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import type { PLZData } from '@/services/locationDemoData';

interface GrowthPotentialChartProps {
  plzData: PLZData[];
}

const POTENTIAL_COLORS: Record<string, string> = {
  high: 'hsl(142, 76%, 36%)',
  medium: 'hsl(38, 92%, 50%)',
  low: 'hsl(215, 16%, 47%)',
};

export default function GrowthPotentialChart({ plzData }: GrowthPotentialChartProps) {
  const top10 = [...plzData]
    .filter(p => p.members > 0)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.growthPotential] - order[b.growthPotential] || b.members - a.members;
    })
    .slice(0, 10)
    .map(p => ({
      label: `${p.plz}`,
      name: p.name,
      members: p.members,
      potential: Math.round(p.population * 0.003) - p.members,
      growthPotential: p.growthPotential,
    }));

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={top10}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => [
              `${value}`,
              name === 'members' ? 'Current Members' : 'Growth Potential',
            ]}
            labelFormatter={(label) => {
              const item = top10.find(d => d.label === label);
              return item ? `${label} ${item.name}` : label;
            }}
          />
          <Legend />
          <Bar dataKey="members" name="Current Members" stackId="a" radius={[0, 0, 0, 0]}>
            {top10.map((entry, index) => (
              <Cell
                key={`members-${index}`}
                fill={POTENTIAL_COLORS[entry.growthPotential]}
              />
            ))}
          </Bar>
          <Bar dataKey="potential" name="Growth Potential" stackId="a" radius={[4, 4, 0, 0]}>
            {top10.map((entry, index) => (
              <Cell
                key={`potential-${index}`}
                fill={POTENTIAL_COLORS[entry.growthPotential]}
                opacity={0.35}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
