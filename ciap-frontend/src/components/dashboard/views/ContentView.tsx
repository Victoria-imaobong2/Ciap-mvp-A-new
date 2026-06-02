"use client";

import React from "react";
import { DashboardNavbar } from "../DashboardNavbar";
import { DashboardGreeting } from "../DashboardGreeting";
import { ContentCard } from "../ContentCard";

interface ContentViewProps {
  userName: string;
  activeTab: string;
  setActiveTab: (val: string) => void;
  connectedPlatforms?: string[];
  content?: any[];
  activeDateRange: string;
  isDateMenuOpen: boolean;
  dateRanges: string[];
  onToggleDateMenu: () => void;
  onSelectDateRange: (range: string) => void;
}

export function ContentView({
  userName,
  activeTab,
  setActiveTab,
  connectedPlatforms,
  content = [],
  activeDateRange,
  isDateMenuOpen,
  dateRanges,
  onToggleDateMenu,
  onSelectDateRange,
}: ContentViewProps) {
  // Format numbers (e.g., 1200000 -> 1.2M)
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatEngagement = (val: number) => (val * 100).toFixed(1) + "%";

  return (
    <div className="space-y-0 animate-in fade-in duration-500">
      <DashboardNavbar
        desktopTitle="Content"
        mobileTitle="Contents"
        mobileIcon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" /><rect width="14" height="12" x="2" y="6" rx="2" /></svg>
        }
        activeDateRange={activeDateRange}
        isDateMenuOpen={isDateMenuOpen}
        dateRanges={dateRanges}
        onToggleDateMenu={onToggleDateMenu}
        onSelectDateRange={onSelectDateRange}
      />

      {/* --- MAIN CONTENT AREA --- */}
      <div className="lg:px-12 pb-10">
        <DashboardGreeting
          name={userName}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={connectedPlatforms}
        />

        {/* --- SECTION HEADER + SORT --- */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Curation</p>
            <div className="flex items-center gap-3">
              <h2 className="text-[22px] font-black text-slate-900 tracking-tight leading-tight">Top Performing Content</h2>
              <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M7 12h10M11 18h2" /></svg>
            </div>
          </div>
          <div className="relative">
            <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
              Sort by: Views
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>

        {/* --- CONTENT CARDS --- */}
        <div className="space-y-5 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-6">
          {content.length > 0 ? (
            content.map((item, idx) => (
              <ContentCard
                key={item.id || idx}
                title={item.title}
                description={item.description}
                views={formatNumber(item.views)}
                engagement={formatEngagement(item.engagement)}
                engagementDelta="+0%" // We could calculate this if we had history
                platform={item.platform}
                imageUrl={item.thumbnail_url}
                status={idx === 0 ? "top" : "normal"}
              />
            ))
          ) : (
            <div className="lg:col-span-2 py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">No content found for this period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
