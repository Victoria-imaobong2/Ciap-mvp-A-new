"use client";

import React from "react";
import { DashboardNavbar } from "../DashboardNavbar";
import { DashboardGreeting } from "../DashboardGreeting";

interface CreatorOverviewViewProps {
  userName: string;
  activeTab: string;
  setActiveTab: (val: string) => void;
  connectedPlatforms?: string[];
  stats?: any;
  activeDateRange: string;
  isDateMenuOpen: boolean;
  dateRanges: string[];
  onToggleDateMenu: () => void;
  onSelectDateRange: (range: string) => void;
}

export function CreatorOverviewView({
  userName,
  activeTab,
  setActiveTab,
  connectedPlatforms,
  stats,
  activeDateRange,
  isDateMenuOpen,
  dateRanges,
  onToggleDateMenu,
  onSelectDateRange,
}: CreatorOverviewViewProps) {
  const summary = stats?.summary || {};
  const score = Math.round(summary.influence_score || 0);
  
  // Format numbers (e.g., 1200000 -> 1.2M)
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatEngagement = (val: number) => (val * 100).toFixed(1) + "%";
  const formatGrowth = (val: number) => (val >= 0 ? "+" : "") + val.toFixed(1) + "%";
  const formatDeltaCount = (val: number) => {
    if (val === 0) return "0";
    return val > 0 ? `+${formatNumber(val)}` : formatNumber(val);
  };

  function sparklinePath(values: number[], w = 100, h = 40): string {
    if (!values.length) return "M0,20 L100,20";
    if (values.length === 1) {
      const y = h - ((values[0] / Math.max(values[0], 1)) * (h - 4)) - 2;
      return `M0,${y} L${w},${y}`;
    }
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const pad = 2;
    const uh = h - pad * 2;
    const step = w / (values.length - 1);
    return values.map((v, i) => {
      const x = i * step;
      const y = pad + uh - ((v - min) / range) * uh;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    }).join(" ");
  }

  // Generate simple dynamic insights based on stats
  const generateInsights = () => {
    const insights = [];
    if (summary.views_growth_pct > 0.05) {
      insights.push({
        title: "Strong View Momentum",
        desc: `Your views have grown by ${formatGrowth(summary.views_growth_pct)} compared to the previous period. Keep pushing content like your recent top performers.`
      });
    } else if (summary.views_growth_pct < 0) {
      insights.push({
        title: "Views Are Dipping",
        desc: "Consider experimenting with new formats or checking if your upload schedule aligns with your audience's active hours."
      });
    }

    if (summary.engagement_delta > 0) {
      insights.push({
        title: "Engagement is Up!",
        desc: "Your audience is interacting more. Reply to comments to boost community loyalty further."
      });
    } else if (summary.engagement_delta < 0) {
      insights.push({
        title: "Engagement Dropped Slightly",
        desc: "Try ending your videos with a stronger call-to-action or a question to encourage more comments."
      });
    }

    if (summary.followers_delta > 50) {
      insights.push({
        title: "Solid Follower Growth",
        desc: `You've gained ${formatDeltaCount(summary.followers_delta)} new followers. They likely discovered you through your recent high-performing content.`
      });
    }

    // Fallbacks if nothing is significant
    if (insights.length === 0) {
      insights.push({
        title: "Consistent Performance",
        desc: "Your metrics are holding steady. This is a great time to experiment with a new content format without risking major drops."
      });
      insights.push({
        title: "Optimize Your Titles",
        desc: "Try A/B testing slightly different thumbnail or title styles to see if it moves the needle on click-through rates."
      });
    }

    return insights.slice(0, 2); // Show top 2
  };

  return (
    <div className="space-y-0 animate-in fade-in duration-500">
      <DashboardNavbar
        desktopTitle="Overview"
        mobileTitle="Dashboard"
        mobileIcon={
          <div className="grid grid-cols-2 gap-[2px] w-5 h-5">
            <div className="bg-slate-900 rounded-[2px]" />
            <div className="border-2 border-slate-900 rounded-[2px]" />
            <div className="border-2 border-slate-900 rounded-[2px]" />
            <div className="bg-slate-900 rounded-[2px]" />
          </div>
        }
        activeDateRange={activeDateRange}
        isDateMenuOpen={isDateMenuOpen}
        dateRanges={dateRanges}
        onToggleDateMenu={onToggleDateMenu}
        onSelectDateRange={onSelectDateRange}
      />

      {/* --- CONTENT CONTAINER --- */}
      <div className="lg:px-12 pb-10">
        <DashboardGreeting
          name={userName}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={connectedPlatforms}
        />

        {/* --- DESKTOP GRID --- */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 gap-6">

          {/* --- INFLUENCE SCORE --- */}
          <div className="lg:col-span-3 w-full bg-[#F4F6FF] rounded-[2.5rem] p-8 relative overflow-hidden shadow-[0_8px_24px_rgba(79,70,229,0.06)]">
            <div className="space-y-1 mb-6">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Influence Score</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-[56px] font-black text-slate-900 tracking-tighter leading-none">{score}</span>
                <span className="text-[20px] font-bold text-slate-300">/100</span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-white rounded-full mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-[#4F46E5] rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" style={{ width: `${score}%` }} />
            </div>
            <p className="text-[12px] font-medium text-slate-500">
              Top 5% of creators in <span className="font-bold">your</span> niche this week.
            </p>
          </div>

          {/* --- MINI STATS --- */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 lg:gap-8">
            <div className="bg-white rounded-[2.5rem] p-7 lg:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50/50">
              <div className="flex items-center gap-2 mb-2 lg:mb-4">
                <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Views</span>
              </div>
              <p className="text-[32px] lg:text-[32px] font-black text-slate-900 mb-6 lg:mb-8 tracking-tight">{formatNumber(summary.total_views || 0)}</p>
              <div className="relative h-16 lg:h-24 w-full flex flex-col justify-end">
                <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full stroke-[#4F46E5] stroke-[2.5] fill-none overflow-visible">
                  <path d={sparklinePath((stats?.trend || []).map((t: any) => t.views))} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="self-end text-[12px] font-bold text-[#4F46E5] bg-white pl-1 relative z-10 translate-y-2 lg:translate-y-4">{formatGrowth(summary.views_growth_pct || 0)}</span>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-7 lg:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50/50">
              <div className="flex items-center gap-2 mb-2 lg:mb-4">
                <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 14-4-8-8 8" /></svg>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Engagement</span>
              </div>
              <p className="text-[32px] lg:text-[32px] font-black text-slate-900 mb-6 lg:mb-8 tracking-tight">{formatEngagement(summary.engagement_rate || 0)}</p>
              <div className="relative h-16 lg:h-24 w-full flex flex-col justify-end">
                <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full stroke-[#DC2626] stroke-[2.5] fill-none overflow-visible">
                  <path d={sparklinePath((stats?.trend || []).map((t: any) => t.likes))} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="self-end text-[12px] font-bold text-[#DC2626] bg-white pl-1 relative z-10 translate-y-2 lg:translate-y-4">{formatGrowth(summary.views_growth_pct || 0)}</span>
              </div>
            </div>
          </div>

          {/* --- FOLLOWER GROWTH --- */}
          <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-7 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50/50 flex justify-between items-center lg:flex-col lg:items-start lg:justify-start lg:gap-2 lg:pb-8">
            <div className="lg:w-full">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Follower Growth</p>
              <div className="flex items-baseline gap-2">
                <p className="text-[36px] lg:text-[28px] font-black text-slate-900 leading-none tracking-tight">{formatDeltaCount(summary.followers_delta || 0)}</p>
                <span className="text-[14px] font-bold text-[#4F46E5]">{formatGrowth(summary.followers_growth_pct || 0)}</span>
              </div>
            </div>
            <div className="h-12 lg:h-20 w-[100px] lg:w-full mt-2 lg:mt-4">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full stroke-[#4F46E5] stroke-[2.5] fill-none overflow-visible">
                <path d={sparklinePath((stats?.trend || []).map((t: any) => t.followers))} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          {/* --- GROWTH TREND --- */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[17px] font-black text-slate-900">Growth Trend</h3>
              <button className="text-slate-400 font-bold tracking-widest text-lg leading-none mb-2">•••</button>
            </div>
            <div className="bg-[#F8FAFC] lg:bg-white lg:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] lg:border lg:border-slate-50/50 rounded-[2.5rem] p-8 pb-6">
              <div className="flex items-end justify-between h-40 lg:h-48 gap-2 lg:gap-4 mb-4 lg:mb-6">
                {(stats?.trend?.length > 0 ? stats.trend : Array(7).fill({ value: 0 })).map((item: any, idx: number) => {
                  const maxVal = Math.max(...(stats?.trend?.map((t: any) => t.value) || [100]));
                  const height = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                  return (
                    <div 
                      key={idx}
                      style={{ height: `${Math.max(height, 5)}%` }}
                      className={`w-full rounded-t-sm transition-all duration-500 hover:bg-[#4F46E5] ${
                        idx === (stats?.trend?.length - 1) ? "bg-[#4F46E5]" : "bg-[#BCC1F4]"
                      }`}
                      title={`${item.date}: ${item.value} views`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase lg:px-2">
                {stats?.trend?.length > 0 ? (
                  stats.trend.map((item: any, idx: number) => {
                    const date = new Date(item.date);
                    // Show labels for every few items if list is long
                    if (stats.trend.length > 10 && idx % 5 !== 0) return <span key={idx}></span>;
                    return (
                      <span key={idx}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    );
                  })
                ) : (
                  <><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></>
                )}
              </div>
            </div>
          </div>

          {/* --- SMART INSIGHTS --- */}
          <div className="lg:col-span-4 bg-[#F4F6FF] rounded-[2.5rem] p-8">
            <h3 className="text-[17px] font-black text-slate-900 mb-6">Smart Insights</h3>
            <div className="space-y-4">
              {generateInsights().map((insight, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-1">
                  <h4 className="text-[12px] font-black text-slate-900 mb-1.5">{insight.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">{insight.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
