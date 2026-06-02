"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
} from "recharts";

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

interface DataPoint {
  month: string;
  followers: number;
}

interface FollowersGrowthChartProps {
  data?: DataPoint[];
}

const defaultData: DataPoint[] = [
  { month: "SUN", followers: 1 },
  { month: "MON", followers: 1 },
  { month: "TUE", followers: 1 },
  { month: "WED", followers: 1 },
  { month: "THU", followers: 1 },
  { month: "FRI", followers: 1 },
  { month: "SAT", followers: 1 },
  { month: "NOW", followers: 1 },
];

export function FollowersGrowthChart({ data: propData }: FollowersGrowthChartProps) {
  const chartData = propData && propData.length > 0 ? propData : defaultData;
  const last = chartData[chartData.length - 1];

  return (
    <div className="w-full h-56 lg:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="followersFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fontWeight: 700, fill: "#94A3B8" }}
            height={24}
            interval="preserveStartEnd"
          />
          <Area
            type="monotone"
            dataKey="followers"
            stroke="#4F46E5"
            strokeWidth={2.5}
            fill="url(#followersFill)"
            dot={false}
            activeDot={{ r: 5, fill: "#4F46E5", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
