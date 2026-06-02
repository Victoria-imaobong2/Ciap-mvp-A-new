"use client";

import React from "react";
import { DashboardNavbar } from "../DashboardNavbar";

interface SmeOverviewViewProps {
  stats?: any;
  activeDateRange: string;
  isDateMenuOpen: boolean;
  dateRanges: string[];
  onToggleDateMenu: () => void;
  onSelectDateRange: (range: string) => void;
}

export function SmeOverviewView({
  stats,
  activeDateRange,
  isDateMenuOpen,
  dateRanges,
  onToggleDateMenu,
  onSelectDateRange,
}: SmeOverviewViewProps) {
  const summary = stats?.summary || {};
  const campaigns = stats?.campaigns || [];
  const company = stats?.company || {};
  const recommended = stats?.recommended_creators || [];
  const totalBudget = campaigns.reduce((s: number, c: any) => s + (c.budget || 0), 0);
  return (
    <div className="space-y-0 animate-in fade-in duration-500">
      <DashboardNavbar
        desktopTitle="Quarterly Overview"
        mobileTitle="Overview"
        mobileIcon={
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm11 3a3 3 0 0 1 3 3c0 .59-.17 1.14-.46 1.6l1.88 1.88-1.42 1.42-1.88-1.88c-.46.29-1.01.46-1.6.46a3 3 0 1 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" /></svg>
        }
        activeDateRange={activeDateRange}
        isDateMenuOpen={isDateMenuOpen}
        dateRanges={dateRanges}
        onToggleDateMenu={onToggleDateMenu}
        onSelectDateRange={onSelectDateRange}
      />

      {/* --- CONTENT CONTAINER --- */}
      <div className="lg:px-12 pb-10">
        <div className="flex justify-between items-center mb-8 lg:hidden">
          <div>
            <h2 className="text-[22px] font-black text-slate-900 leading-tight">Quarterly Overview</h2>
            <p className="text-[12px] text-slate-500 font-medium mt-1">Summary of {summary.active_campaigns || 0} active campaigns.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Total Spend */}
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] border border-slate-50 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Spend</p>
              <p className="text-[28px] font-black text-slate-900 leading-none">${(summary.total_spend || 0).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400">Active campaigns</span>
            </div>
          </div>

          {/* Total Reach */}
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] border border-slate-50 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Reach</p>
              <p className="text-[28px] font-black text-slate-900 leading-none">{(summary.total_reach || 0).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400">Across all campaigns</span>
            </div>
          </div>

          {/* Engagement */}
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] border border-slate-50 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Engagement</p>
              <p className="text-[28px] font-black text-slate-900 leading-none">{(summary.total_engagement || 0).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400">Total interactions</span>
            </div>
          </div>

          {/* Total ROI */}
          <div className="bg-[#4F46E5] rounded-[2rem] p-6 shadow-[0_8px_32px_-8px_rgba(79,70,229,0.2)] flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Total ROI</p>
              <p className="text-[32px] font-black text-white leading-none">{summary.roi || 0}x</p>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <span className="text-[11px] font-bold text-white">{summary.active_campaigns || 0} campaigns</span>
            </div>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-white rounded-[2.5rem] p-7 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] border border-slate-50 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[14px] font-black text-slate-900">Performance Trend</h3>
            <div className="bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="text-[10px] font-bold text-slate-600">Last 30 Days</span>
            </div>
          </div>
          <div className="h-32 w-full mt-2 flex items-center justify-center text-slate-400 text-sm font-medium">
            {campaigns.length > 0 ? "Chart coming soon" : "Create a campaign to see performance trends"}
          </div>
        </div>

        {/* Smart Insights */}
        <div className="bg-[#F4F6FF] rounded-[2.5rem] p-7 mt-6">
          <h3 className="text-[15px] font-black text-slate-900 mb-5">Smart Insights</h3>
          <div className="space-y-4">
            {summary.active_campaigns > 0 ? (
              <>
                <div className="bg-white rounded-3xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-1">
                  <h4 className="text-[12px] font-black text-slate-900 mb-1.5">Campaign Performance</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">
                    You have {summary.active_campaigns} active campaign{summary.active_campaigns > 1 ? 's' : ''} with ${summary.total_spend?.toLocaleString() || 0} total spend and {summary.roi || 0}x ROI.
                  </p>
                </div>
                <div className="bg-white rounded-3xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-1">
                  <h4 className="text-[12px] font-black text-slate-900 mb-1.5">Budget Optimization</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">
                    Recommended budget: ${(summary.recommended_budget || 0).toLocaleString()}. Consider distributing across {summary.available_creators || 0} available creators.
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <h4 className="text-[12px] font-black text-slate-900 mb-1.5">Getting Started</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Create your first campaign to start tracking performance and ROI. Discover creators in the Discovery tab.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Creators */}
        {recommended.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[16px] font-black text-slate-900">Recommended Creators</h3>
            <button className="text-[11px] font-bold text-[#4F46E5]">View All</button>
          </div>
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] border border-slate-50 space-y-6">
            {recommended.map((creator: any, idx: number) => (
              <div key={creator.id || idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    {creator.avatar_url ? (
                      <img src={creator.avatar_url} alt={creator.handle || creator.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#4F46E5] flex items-center justify-center text-white font-bold text-sm">
                        {(creator.handle || creator.name || "?")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-slate-900">@{creator.handle || creator.name || "creator"}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{creator.category || "CREATOR"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-black text-[#4F46E5]">{creator.followers?.toLocaleString() || "N/A"} followers</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">{creator.influence_score ? `${creator.influence_score}/100` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        <div className="mt-8">
          <button className="w-full bg-[#4F46E5] text-white text-[15px] font-black rounded-[1.5rem] py-4 hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2">
            Export Report
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
