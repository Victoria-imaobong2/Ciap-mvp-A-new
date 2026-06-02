"use client"; 
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface ChartProps {
  data: string[]; // 
  color?: string;
}

export const PerformanceChart = ({ data, color = "#4F46E5" }: ChartProps) => {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};