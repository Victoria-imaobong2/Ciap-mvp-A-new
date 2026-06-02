"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function formatK(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

interface DataPoint {
  day: string;
  current: number;
  previous: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const day = parseInt(label ?? "1");

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)] border border-slate-100 px-4 py-3 min-w-[130px]">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Day {day}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[10px] font-bold text-slate-500">{p.name}</span>
          </div>
          <span className="text-[13px] font-black text-slate-900">{formatK(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function AudienceGrowthChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="w-full h-52 lg:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke="#F1F5F9"
            strokeDasharray="0"
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fontWeight: 700, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tickFormatter={formatK}
            tick={{ fontSize: 9, fontWeight: 700, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#CBD5E1", strokeWidth: 1, strokeDasharray: "4 3" }}
          />
          <Line
            name="Previous 30 Days"
            type="monotone"
            dataKey="previous"
            stroke="#E2E8F0"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#E2E8F0", stroke: "#fff", strokeWidth: 2 }}
          />
          <Line
            name="Last 30 Days"
            type="monotone"
            dataKey="current"
            stroke="#4F46E5"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#4F46E5", stroke: "#fff", strokeWidth: 2 }}
          />
          <Legend
            verticalAlign="bottom"
            height={32}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: 11, fontWeight: 700, color: value === "Last 30 Days" ? "#64748B" : "#94A3B8" }}>
                {value}
              </span>
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
