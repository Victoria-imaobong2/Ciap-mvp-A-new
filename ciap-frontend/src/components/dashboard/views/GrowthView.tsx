"use client";

import React from "react";
import { DashboardNavbar } from "../DashboardNavbar";
import { DashboardGreeting } from "../DashboardGreeting";
import { StatBar } from "../StatBar";
import { FollowersGrowthChart } from "../FollowersGrowthChart";

interface GrowthViewProps {
  userName: string;
  stats?: any;
  audienceTimeTab: string;
  setAudienceTimeTab: (val: string) => void;
  setActiveView: (view: string) => void;
  activeDateRange: string;
  isDateMenuOpen: boolean;
  dateRanges: string[];
  onToggleDateMenu: () => void;
  onSelectDateRange: (range: string) => void;
}

export function GrowthView({
  userName,
  stats,
  audienceTimeTab,
  setAudienceTimeTab,
  setActiveView,
  activeDateRange,
  isDateMenuOpen,
  dateRanges,
  onToggleDateMenu,
  onSelectDateRange,
}: GrowthViewProps) {
  const summary = stats?.summary || {};
  const trend = stats?.trend || [];
  const latestFollowers = trend.length > 0 ? trend[trend.length - 1].followers : null;
  const followerCount = latestFollowers ?? summary.followers_delta ?? 0;
  const chartData = trend.length > 1
    ? trend.map((t: any, i: number) => ({
        month: i === trend.length - 1 ? "NOW" : "",
        followers: t.followers || 0,
      }))
    : [];
  return (
    <div className="space-y-0 animate-in fade-in duration-500">
      <DashboardNavbar
        desktopTitle="Insights & Growth"
        mobileTitle="Insights & Growth"
        mobileIcon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
        }
        activeDateRange={activeDateRange}
        isDateMenuOpen={isDateMenuOpen}
        dateRanges={dateRanges}
        onToggleDateMenu={onToggleDateMenu}
        onSelectDateRange={onSelectDateRange}
      />

      <div className="lg:px-12 pb-10">
        <DashboardGreeting
          name={userName}
          activeTab={audienceTimeTab}
          onTabChange={setAudienceTimeTab}
          tabs={["Last 30 Days", "Last 90 Days", "Last 6 Mo"]}
        />

        <h2 className="text-[22px] font-black text-slate-900 tracking-tight mb-5">Growth &amp; Stats</h2>

        {/* ── FOLLOWERS CHART CARD ─────────────────── */}
        <div className="bg-white rounded-[2rem] p-7 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] border border-slate-50 mb-5">
          <p className="text-[13px] font-bold text-slate-400 mb-2">Followers</p>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-[36px] lg:text-[44px] font-black text-slate-900 tracking-tight leading-none">
              {followerCount.toLocaleString()}
            </span>
            <span className="text-[16px] font-black text-[#4F46E5]">{summary.followers_growth_pct >= 0 ? "+" : ""}{summary.followers_growth_pct || 0}%</span>
          </div>
          <FollowersGrowthChart data={chartData.length > 0 ? chartData : undefined} />
        </div>

        {/* ── GOAL TRACKER CARD ────────────────────── */}
        <div className="relative bg-[#4F46E5] rounded-[2rem] p-7 overflow-hidden mb-5">
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/10 -translate-y-16 translate-x-16" />
          <h3 className="text-[22px] font-black text-white leading-snug mb-3 relative z-10">
            On track for {Math.ceil(followerCount * 2).toLocaleString()}<br />followers by June.
          </h3>
          <p className="text-[13px] text-white/70 font-medium leading-relaxed mb-6 relative z-10">
            Keep creating content and engaging with your audience to maintain growth momentum.
          </p>
          <div className="h-1.5 w-full bg-white/25 rounded-full mb-4 relative z-10">
            <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, Math.round(followerCount / 100))}%` }} />
          </div>
          <div className="flex justify-between relative z-10">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Current: {followerCount.toLocaleString()}</span>
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Goal: {(followerCount * 2).toLocaleString()}</span>
          </div>
        </div>

        {/* ── SOCIAL ORIGINS ───────────────────────── */}
        <div className="bg-white rounded-[2rem] p-7 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] border border-slate-50 mb-5">
          <h3 className="text-[20px] font-black text-slate-900 mb-6">Social Origins</h3>
          <div className="space-y-5">
            {[
              {
                name: "YouTube", value: followerCount, max: followerCount, color: "#EF4444",
                icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="#EF4444"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              },
            ].map((p) => (
              <StatBar
                key={p.name}
                bare
                label={p.name}
                percentage={100}
                value={p.value.toLocaleString()}
                icon={p.icon}
                barColor="#94A3B8"
              />
            ))}
          </div>
        </div>

        {/* ── AVG GROWTH + STATS ROW ────────────────── */}
        {followerCount > 0 && (
        <div className="bg-white rounded-[2rem] p-7 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] border border-slate-50 mb-5">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Avg. Growth Per Post</p>
          <p className="text-[36px] font-black text-slate-900 tracking-tight leading-none mb-2">+{Math.round(followerCount / 10).toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mb-6">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
            <span className="text-[13px] font-bold text-emerald-500">{summary.views_growth_pct || 0}% vs prev. month</span>
          </div>
          <div className="h-px bg-[#F1F5F9] mb-6" />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Views</p>
              <p className="text-[28px] font-black text-slate-900 leading-none mb-1">{summary.total_views || 0}</p>
              <p className="text-[12px] font-bold text-slate-400">Lifetime views</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Engagement Rate</p>
              <p className="text-[28px] font-black text-slate-900 leading-none mb-1">{summary.engagement_rate ? (summary.engagement_rate * 100).toFixed(1) + "%" : "0%"}</p>
              <p className="text-[12px] font-bold text-slate-400">Likes + comments ratio</p>
            </div>
          </div>
        </div>
        )}

        {/* ── CTA CARD ─────────────────────────────── */}
        <div className="bg-[#F1F3F8] rounded-[2rem] p-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative w-[108px] h-[80px] shrink-0">
              <div className="absolute top-0 left-0 w-[68px] h-[80px] rounded-2xl overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=240&fit=crop&crop=face"
                  alt="fan"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-0 left-[40px] w-[68px] h-[80px] rounded-2xl overflow-hidden shadow-md ring-2 ring-white">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=240&fit=crop&crop=face"
                  alt="fan"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h3 className="text-[18px] font-black text-slate-900 leading-tight mb-1.5">Top 1% Audience</h3>
              <p className="text-[13px] text-slate-500 font-medium leading-snug">Your core fans are 4x more active than the platform average.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveView("audience")}
            className="w-full bg-[#4F46E5] text-white text-[15px] font-black rounded-full py-4 hover:bg-[#4338CA] transition-colors"
          >
            Explore Audience
          </button>
        </div>
      </div>
    </div>
  );
}
