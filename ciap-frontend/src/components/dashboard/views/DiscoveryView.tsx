"use client";

import React, { useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { DashboardNavbar } from "../DashboardNavbar";
import { apiService } from "@/services/api";

interface CreatorItem {
  id: string;
  full_name: string;
  category?: string | null;
  location?: string | null;
  followers?: number;
  influence_score?: number;
  top_platform?: string | null;
  platform?: string | null;
  social_links?: Record<string, string>;
}

interface DiscoveryViewProps {
  userName: string;
  discoverySearch: string;
  setDiscoverySearch: (val: string) => void;
  selectedCreatorsCount: number;
  setSelectedCreatorsCount: (count: number) => void;
  onCompare: (selectedIds: string[]) => void;
  activeDateRange: string;
  isDateMenuOpen: boolean;
  dateRanges: string[];
  onToggleDateMenu: () => void;
  onSelectDateRange: (range: string) => void;
}

export function DiscoveryView({
  userName,
  discoverySearch,
  setDiscoverySearch,
  selectedCreatorsCount,
  setSelectedCreatorsCount,
  onCompare,
  activeDateRange,
  isDateMenuOpen,
  dateRanges,
  onToggleDateMenu,
  onSelectDateRange,
}: DiscoveryViewProps) {
  const [creators, setCreators] = React.useState<CreatorItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchCreators = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const params: { limit: number; query?: string } = { limit: 50 };
      if (query?.trim()) params.query = query.trim();
      const res = await apiService.fetchCreators(params);
      setCreators(res?.data?.items || []);
    } catch {
      setCreators([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCreators(discoverySearch);
  }, []);

  const handleSearch = useCallback(
    (val: string) => {
      setDiscoverySearch(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchCreators(val), 350);
    },
    [fetchCreators, setDiscoverySearch]
  );

  const toggleSelection = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedCreatorsCount(next.size);
        return next;
      });
    },
    [setSelectedCreatorsCount]
  );

  const handleSave = useCallback(async (creatorId: string) => {
    setSavingId(creatorId);
    try {
      await apiService.saveCreator(creatorId);
    } catch {
      // already saved — ignore
    } finally {
      setSavingId(null);
    }
  }, []);

  return (
    <div className="space-y-0 animate-in fade-in duration-500">
      <DashboardNavbar
        desktopTitle="Creator Discovery"
        mobileTitle="Discovery"
        mobileIcon={
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        }
        activeDateRange={activeDateRange}
        isDateMenuOpen={isDateMenuOpen}
        dateRanges={dateRanges}
        onToggleDateMenu={onToggleDateMenu}
        onSelectDateRange={onSelectDateRange}
      />

      <div className="lg:px-12 pb-10">
        <div className="mb-8 lg:hidden">
          <h2 className="text-[24px] font-black text-slate-900 leading-tight">Welcome Back, <span className="text-[#4F46E5]">{userName}</span></h2>
          <p className="text-[12px] text-slate-500 font-medium mt-1">Identify and analyze the best influencer partners</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, category, or interest"
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 shadow-sm"
            value={discoverySearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Creator Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : creators.length === 0 ? (
            <div className="col-span-full rounded-[2rem] bg-white p-12 text-center shadow-sm border border-slate-50">
              <p className="text-[17px] font-black text-slate-900">No creators found</p>
              <p className="mt-2 text-sm font-medium text-slate-500">{discoverySearch ? "Try a different search term." : "No creators are available yet."}</p>
            </div>
          ) : (
            creators.map((c) => {
              const isSelected = selectedIds.has(c.id);
              const score = c.influence_score ?? 0;
              return (
                <div key={c.id} className="bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] border border-slate-50 flex flex-col">
                  {/* Card Banner */}
                  <div className="h-28 bg-gradient-to-br from-[#4F46E5]/10 to-[#4F46E5]/5 relative shrink-0">
                    <button
                      onClick={() => handleSave(c.id)}
                      disabled={savingId === c.id}
                      className="absolute top-4 right-4 w-7 h-7 bg-white/80 backdrop-blur-md rounded-lg flex items-center justify-center text-slate-500 hover:text-[#4F46E5] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    </button>
                  </div>

                  <div className="px-5 pb-6 pt-0 -mt-10 relative flex flex-col flex-grow">
                    <div className="flex justify-between items-end mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-[#4F46E5] border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-black">
                        {(c.full_name || "?")[0].toUpperCase()}
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-[#4F46E5] flex flex-col items-center justify-center text-white mb-1">
                          <span className="text-[14px] font-black leading-none">{Math.round(score)}</span>
                        </div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Influence</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-[18px] font-black text-slate-900 tracking-tight">{c.full_name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{c.category || c.top_platform || "Creator"}</p>
                    </div>

                    {/* Main Metrics */}
                    <div className="flex justify-between border-y border-slate-50 py-3 mb-4">
                      <div className="text-center">
                        <p className="text-[13px] font-black text-slate-900">{c.followers?.toLocaleString() || "0"}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[13px] font-black text-slate-900">{c.top_platform || c.platform || "—"}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Platform</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[13px] font-black text-slate-900">{c.location || "—"}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Location</p>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] font-bold mb-1.5">
                        <span className="text-slate-500">Influence Score</span>
                        <span className="text-[#4F46E5]">{Math.round(score)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-50">
                        <div className="h-2 rounded-full bg-[#4F46E5]" style={{ width: `${Math.min(score, 100)}%` }} />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Link
                        href={`/sme/saved-creators/${c.id}`}
                        className="flex-1 bg-[#4F46E5] text-white text-[13px] font-black rounded-xl py-3 shadow-lg shadow-[#4F46E5]/20 hover:bg-[#4338CA] transition-all text-center"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => toggleSelection(c.id)}
                        className={`w-12 h-12 border-2 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                          isSelected ? "bg-white border-[#4F46E5] text-[#4F46E5]" : "border-slate-100 text-slate-400"
                        }`}
                        aria-label={isSelected ? "Remove from compare" : "Add to compare"}
                      >
                        {isSelected ? (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5v14" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Compare Bar */}
      {selectedCreatorsCount > 0 && (
        <div className="fixed bottom-12 inset-x-0 z-40 animate-in slide-in-from-bottom-10 duration-500 pointer-events-none lg:pl-[260px]">
          <div className="mx-auto w-full max-w-5xl px-6 lg:px-12 pointer-events-auto">
            <div className="bg-slate-900 rounded-[2rem] p-4 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#4F46E5] rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-white">{selectedCreatorsCount}</div>
                </div>
                <div>
                  <p className="text-white text-[14px] font-black">{selectedCreatorsCount} Creator{selectedCreatorsCount > 1 ? 's' : ''} Selected</p>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Select 2+ to compare side by side</p>
                </div>
              </div>
              <button
                onClick={() => onCompare(Array.from(selectedIds))}
                disabled={selectedCreatorsCount < 2}
                className={`text-[13px] font-black px-6 py-3 rounded-xl transition-all ${
                  selectedCreatorsCount >= 2
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                }`}
              >
                Compare Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
