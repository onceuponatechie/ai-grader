import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { color } from '@/lib/design-tokens';

type Bucket = {
  label: string;
  range: string;
  count: number;
};

type Props = {
  scores: { score: number; total: number }[];
};

const BUCKETS: { label: string; range: string; min: number; max: number }[] = [
  { label: '0–20', range: '0–20%', min: 0, max: 20 },
  { label: '21–40', range: '21–40%', min: 21, max: 40 },
  { label: '41–60', range: '41–60%', min: 41, max: 60 },
  { label: '61–80', range: '61–80%', min: 61, max: 80 },
  { label: '81–100', range: '81–100%', min: 81, max: 100 },
];

export function ScoreDistribution({ scores }: Props) {
  const data: Bucket[] = BUCKETS.map((b) => ({
    label: b.label,
    range: b.range,
    count: scores.filter((s) => {
      if (s.total === 0) return false;
      const pct = (s.score / s.total) * 100;
      return pct >= b.min && pct <= b.max;
    }).length,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 0, left: -16, bottom: 0 }}
        >
          <CartesianGrid
            stroke={color.hairline}
            strokeDasharray="0"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: color.ink.tertiary, fontSize: 12 }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: color.ink.tertiary, fontSize: 12 }}
            allowDecimals={false}
            width={40}
          />
          <Tooltip
            cursor={{ fill: color.hairline }}
            contentStyle={{
              borderRadius: 10,
              border: `1px solid ${color.border.default}`,
              boxShadow:
                '0 2px 8px rgba(10, 10, 10, 0.05), 0 1px 2px rgba(10, 10, 10, 0.03)',
              fontSize: 12,
              padding: '8px 10px',
            }}
            labelStyle={{ color: color.ink.tertiary, marginBottom: 2 }}
            formatter={(value: number) => [`${value} students`, 'In this band']}
            labelFormatter={(_label, payload) =>
              payload && payload.length > 0
                ? `Score ${payload[0].payload.range}`
                : ''
            }
          />
          <Bar
            dataKey="count"
            fill={color.ink.primary}
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
