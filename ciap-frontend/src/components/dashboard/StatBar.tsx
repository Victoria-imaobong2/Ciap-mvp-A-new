// src/components/dashboard/StatBar.tsx
import { ReactNode } from "react";

interface StatBarProps {
  label: string;
  percentage?: number;
  value: string;
  trend?: string;
  /** Remove individual card wrapper when embedding inside an existing card */
  bare?: boolean;
  /** Optional icon shown to the left of the label */
  icon?: ReactNode;
  /** Override bar color. Defaults to brand indigo */
  barColor?: string;
}

export const StatBar = ({ label, percentage, value, trend, bare, icon, barColor }: StatBarProps) => {
  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center bg-slate-50 p-1.5 shrink-0">
              {icon}
            </div>
          )}
          <span className={`font-bold ${icon ? "text-[15px] text-slate-800" : "text-[11px] text-slate-500"}`}>
            {label}
          </span>
        </div>
        <span className={
          trend?.startsWith("+")
            ? "text-[#4F46E5] text-[11px] font-bold"
            : icon
            ? "text-[15px] font-black text-slate-800"
            : "text-[11px] font-bold text-slate-700"
        }>
          {trend || value}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor ?? "#4F46E5",
          }}
        />
      </div>
    </>
  );

  if (bare) return <div>{content}</div>;

  return <div className="space-y-1 bg-white p-4 rounded-xl shadow-sm">{content}</div>;
};