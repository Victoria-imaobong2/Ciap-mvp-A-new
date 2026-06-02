"use client";

import React, { useEffect, useState } from "react";
import { apiService } from "@/services/api";

interface CompareCreator {
  id: string;
  full_name: string;
  category?: string | null;
  location?: string | null;
  followers?: number;
  bio?: string | null;
  platforms?: string[];
  score?: { current: number; model_version?: string };
  audience?: Record<string, any>;
  content_highlights?: any[];
  segments?: any[];
}

export function CompareView({
  onBack,
  creatorIds,
}: {
  onBack: () => void;
  creatorIds: string[];
}) {
  const [creators, setCreators] = useState<CompareCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results = await Promise.allSettled(
        creatorIds.map((id) => apiService.fetchCreatorDetail(id))
      );
      if (cancelled) return;
      const items: CompareCreator[] = [];
      for (const r of results) {
        if (r.status === "fulfilled" && r.value?.data) {
          items.push(r.value.data);
        }
      }
      setCreators(items);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [creatorIds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (creators.length < 2) {
    return (
      <div className="space-y-6 pb-20 animate-in fade-in duration-500">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <svg className="w-6 h-6 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 className="text-[20px] font-black text-slate-900">Compare Creators</h2>
        </div>
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
          <p className="text-[17px] font-black text-slate-900">Select 2 or more creators to compare</p>
          <p className="mt-2 text-sm font-medium text-slate-500">Go back and add more creators to the comparison.</p>
        </div>
      </div>
    );
  }

  const maxFollowers = Math.max(...creators.map((c) => c.followers || 0), 1);
  const maxScore = Math.max(...creators.map((c) => c.score?.current || 0), 1);
  const ageGroups = Object.keys(creators[0]?.audience?.age_distribution || {});
  const locationGroups = Object.keys(creators[0]?.audience?.location_distribution || {});

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
          <svg className="w-6 h-6 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h2 className="text-[20px] font-black text-slate-900">Compare Creators</h2>
      </div>

      {/* Creator Avatars */}
      <div className="grid grid-cols-2 gap-4">
        {creators.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-100 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-[#4F46E5] flex items-center justify-center text-white text-3xl font-black">
              {(c.full_name || "?")[0].toUpperCase()}
            </div>
            <h3 className="text-[15px] font-black text-slate-900">{c.full_name}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{c.category || c.platforms?.[0] || "Creator"}</p>
          </div>
        ))}
      </div>

      {/* Score Comparison */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Influence Score</p>
        {creators.map((c) => {
          const score = c.score?.current || 0;
          return (
            <div key={c.id} className="mb-4 last:mb-0">
              <div className="flex justify-between text-[13px] font-bold mb-1.5">
                <span className="text-slate-900">{c.full_name}</span>
                <span className="text-[#4F46E5]">{Math.round(score)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C73F5] transition-all duration-700"
                  style={{ width: `${(score / maxScore) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Followers Comparison (Reach Graph) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Reach (Followers)</p>
        <div className="space-y-4">
          {creators.map((c) => {
            const followers = c.followers || 0;
            return (
              <div key={c.id}>
                <div className="flex justify-between text-[13px] font-bold mb-1.5">
                  <span className="text-slate-900">{c.full_name}</span>
                  <span className="text-slate-900">{followers.toLocaleString()}</span>
                </div>
                <div className="h-4 rounded-full bg-slate-50 overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all duration-700"
                    style={{ width: `${(followers / maxFollowers) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform & Location */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Details</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-3 pr-4">Detail</th>
                  {creators.map((c) => (
                    <th key={c.id} className="pb-3 pr-4">{c.full_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="py-3 pr-4 font-bold text-slate-500">Location</td>
                  {creators.map((c) => (
                    <td key={c.id} className="py-3 pr-4 font-black text-slate-900">{c.location || "—"}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-slate-500">Platform</td>
                  {creators.map((c) => (
                    <td key={c.id} className="py-3 pr-4 font-black text-slate-900">{c.platforms?.[0] || "—"}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-slate-500">Followers</td>
                  {creators.map((c) => (
                    <td key={c.id} className="py-3 pr-4 font-black text-slate-900">{c.followers?.toLocaleString() || "0"}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bio comparison */}
      <div className="grid grid-cols-2 gap-6">
        {creators.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bio</p>
            <p className="text-[13px] font-medium text-slate-700 leading-relaxed">
              {c.bio || "No bio available"}
            </p>
          </div>
        ))}
      </div>

      {/* Audience Demographics */}
      {creators.some((c) => c.audience?.age_distribution) && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Audience Age Distribution</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-3 pr-4">Age Group</th>
                  {creators.map((c) => (
                    <th key={c.id} className="pb-3 pr-4">{c.full_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ageGroups.map((group) => (
                  <tr key={group}>
                    <td className="py-3 pr-4 font-bold text-slate-500">{group}</td>
                    {creators.map((c) => (
                      <td key={c.id} className="py-3 pr-4 font-black text-slate-900">
                        {c.audience?.age_distribution?.[group] != null
                          ? `${c.audience.age_distribution[group]}%`
                          : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Location Distribution */}
      {creators.some((c) => c.audience?.location_distribution) && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top Locations</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-3 pr-4">Country</th>
                  {creators.map((c) => (
                    <th key={c.id} className="pb-3 pr-4">{c.full_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {locationGroups.map((country) => (
                  <tr key={country}>
                    <td className="py-3 pr-4 font-bold text-slate-500">{country}</td>
                    {creators.map((c) => (
                      <td key={c.id} className="py-3 pr-4 font-black text-slate-900">
                        {c.audience?.location_distribution?.[country] != null
                          ? `${c.audience.location_distribution[country]}%`
                          : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interest Tags */}
      {creators.some((c) => c.audience?.interest_tags?.length > 0) && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Interest Tags</p>
          <div className="grid grid-cols-2 gap-6">
            {creators.map((c) => (
              <div key={c.id}>
                <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">{c.full_name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(c.audience?.interest_tags ?? []).length > 0
                    ? (c.audience?.interest_tags ?? []).map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))
                    : <span className="text-[12px] text-slate-400 italic">No tags</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
