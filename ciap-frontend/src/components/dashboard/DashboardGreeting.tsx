"use client";

const DEFAULT_TABS = ["All Platforms", "Instagram", "TikTok"];

interface DashboardGreetingProps {
  name: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** Pass custom tabs to override the default platform tabs */
  tabs?: string[];
}

export function DashboardGreeting({ name, activeTab, onTabChange, tabs }: DashboardGreetingProps) {
  const tabList = tabs ?? DEFAULT_TABS;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-12">
      {/* Greeting */}
      <div className="mb-8 lg:mb-0">
        <h1 className="text-[26px] lg:text-[32px] text-slate-900 tracking-tight">
          Welcome Back, <span className="font-black">{name}</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar lg:bg-white lg:p-1.5 lg:rounded-[2rem] lg:shadow-sm lg:border lg:border-slate-50">
        {tabList.map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={`px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap ${
              activeTab === t
                ? "bg-white lg:bg-[#4F46E5] lg:text-white text-[#4F46E5] shadow-[0_4px_12px_rgba(0,0,0,0.03)] lg:shadow-md"
                : "bg-[#F3F4F6] lg:bg-transparent text-slate-500 lg:hover:bg-slate-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
