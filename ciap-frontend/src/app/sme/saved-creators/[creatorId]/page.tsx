"use client";

import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/services/api";

import { DashboardSidebar } from "@/components/dashboard/navigation/DashboardSidebar";
import { DashboardBottomNav } from "@/components/dashboard/navigation/DashboardBottomNav";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";

type CreatorProfilePageProps = {
  params: Promise<{
    creatorId: string;
  }>;
};

function SettingsIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.33 4.32c.43-1.76 2.91-1.76 3.34 0a1.73 1.73 0 0 0 2.59 1.05c1.55-.93 3.3.82 2.37 2.37a1.73 1.73 0 0 0 1.05 2.59c1.76.43 1.76 2.91 0 3.34a1.73 1.73 0 0 0-1.05 2.59c.93 1.55-.82 3.3-2.37 2.37a1.73 1.73 0 0 0-2.59 1.05c-.43 1.76-2.91 1.76-3.34 0a1.73 1.73 0 0 0-2.59-1.05c-1.55.93-3.3-.82-2.37-2.37a1.73 1.73 0 0 0-1.05-2.59c-1.76-.43-1.76-2.91 0-3.34a1.73 1.73 0 0 0 1.05-2.59c-.93-1.55.82-3.3 2.37-2.37.99.6 2.28.06 2.59-1.05Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}

function InfluenceGauge({ score }: { score: number }) {
  return (
    <div className="relative mx-auto mt-6 h-36 w-48">
      <div className="absolute inset-x-0 top-6 mx-auto h-24 w-48 overflow-hidden">
        <div className="h-48 w-48 rounded-full border-[20px] border-slate-100" />
        <div 
          className="absolute left-0 top-0 h-48 w-48 rounded-full border-[20px] border-transparent border-r-[#4F46E5] border-t-[#4F46E5] transition-transform duration-1000 ease-out" 
          style={{ transform: `rotate(${135 + (score / 100) * 180}deg)` }}
        />
      </div>
      <div className="absolute inset-x-0 top-16 text-center">
        <span className="text-[44px] font-black leading-none text-slate-900">{Math.round(score)}</span>
        <span className="ml-1 text-[16px] font-black text-slate-300">/100</span>
      </div>
    </div>
  );
}

function ProfileMetricCard({ label, value, note, trend }: { label: string; value: string; note?: string; trend?: string }) {
  return (
    <div className="rounded-[1.75rem] bg-white p-7 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.4)] border border-slate-50">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-[32px] font-black leading-none text-slate-900 tracking-tight">{value}</p>
      </div>
      {note && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend === "up" && (
            <svg className="w-3 h-3 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          )}
          <p className={`text-[12px] font-bold ${trend === "up" ? "text-[#4F46E5]" : "text-slate-400"}`}>{note}</p>
        </div>
      )}
    </div>
  );
}

interface CreatorDetail {
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
  social_links?: Record<string, string>;
}

export default function CreatorProfilePage({ params }: CreatorProfilePageProps) {
  const { creatorId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [creator, setCreator] = useState<CreatorDetail | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [detailRes, listRes] = await Promise.all([
          apiService.fetchCreatorDetail(creatorId),
          apiService.fetchCreators({ limit: 10 }),
        ]);
        if (cancelled) return;
        const detail = detailRes?.data;
        if (detail) setCreator(detail);
        const others = (listRes?.data?.items || []).filter((i: any) => i.id !== creatorId);
        setSimilar(others);
      } catch {
        // creator not found
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [creatorId]);

  const role = (user?.role || "SME").toLowerCase();
  const handleSetActiveView = (view: string) => {
    router.push(`/?view=${view}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-12 h-12 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <p className="text-xl font-black text-slate-900">Creator not found</p>
          <Link href="/" className="mt-4 inline-block text-sm font-bold text-[#4F46E5]">Go back</Link>
        </div>
      </div>
    );
  }

  const hireName = creator.full_name.split(" ")[0];
  const influenceScore = creator.score?.current ?? 0;
  const contentItems = creator.content_highlights || [];
  const ageDist = creator.audience?.age_groups || null;
  const locations = creator.audience?.top_locations || null;

  return (
    <main className="min-h-screen relative flex lg:justify-center bg-[#FAFAFA]">
      <DashboardSidebar role={role} activeView="saved" setActiveView={handleSetActiveView} />

      <div className="flex-1 w-full max-w-[480px] lg:max-w-5xl mx-auto min-h-screen pt-0 px-6 pb-44 lg:pb-12 lg:px-12">

        <div className="hidden lg:block">
          <DashboardNavbar
            desktopTitle={creator.full_name}
            mobileTitle="Creator Profile"
            mobileIcon={<div className="w-5 h-5 bg-slate-900 rounded-sm" />}
            activeDateRange="Last 30 Days"
            isDateMenuOpen={false}
            dateRanges={["Last 7 Days", "Last 30 Days", "This Month", "This Year"]}
            onToggleDateMenu={() => {}}
            onSelectDateRange={() => {}}
          />
        </div>

        <header className="flex lg:hidden items-center justify-between pt-8">
          <Image src="/ciap-logo.png" alt="CIAP Logo" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
          <button
            type="button"
            aria-label="Open settings"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-900 transition-colors hover:bg-slate-100"
          >
            <SettingsIcon />
          </button>
        </header>

        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="mt-12 lg:mt-0 flex h-11 w-11 items-center justify-center rounded-full bg-slate-200/70 text-slate-700 transition-colors hover:bg-slate-300"
        >
          <BackIcon />
        </button>

        {/* Profile Info */}
        <section className="mt-8 flex flex-col items-center text-center">
          <div className="h-32 w-32 rounded-[2rem] bg-[#4F46E5] flex items-center justify-center text-white text-5xl font-black border-4 border-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.5)]">
            {creator.full_name[0].toUpperCase()}
          </div>
          <h1 className="mt-6 text-[32px] font-black leading-tight tracking-tight text-slate-900">{creator.full_name}</h1>
          <p className="mt-1.5 text-[13px] font-black uppercase tracking-[0.2em] text-slate-400">{creator.category || creator.platforms?.[0] || "Creator"}</p>
        </section>

        {/* Influence Score Card */}
        <section className="mt-10 rounded-[2.5rem] bg-white p-10 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] border border-slate-50">
          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400">Influence Score</p>
          <InfluenceGauge score={influenceScore} />
          <div className="mt-2">
            <span className="inline-flex rounded-full bg-[#EEF0FF] px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#4F46E5]">
              {influenceScore >= 70 ? "Top Performer" : influenceScore >= 40 ? "Rising Creator" : "Emerging"}
            </span>
          </div>
        </section>

        {/* Stats Row */}
        <section className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-[2rem] bg-white p-7 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] border border-slate-50">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Followers</p>
            <p className="mt-2 text-[28px] font-black text-slate-900">{creator.followers?.toLocaleString() || "0"}</p>
          </div>
          <div className="rounded-[2rem] bg-white p-7 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] border border-slate-50">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Platform</p>
            <p className="mt-2 text-[28px] font-black text-slate-900">{creator.platforms?.[0] || "—"}</p>
          </div>
        </section>

        {/* Extended Metrics */}
        <section className="mt-8 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          <ProfileMetricCard label="Location" value={creator.location || "N/A"} note={creator.bio ? "Has bio" : "No bio"} />
          <ProfileMetricCard label="Platforms" value={String(creator.platforms?.length || 0)} note={creator.platforms?.join(", ") || "None connected"} />
          <ProfileMetricCard label="Score" value={String(Math.round(influenceScore))} note="Influence score" trend="up" />
        </section>

        {/* Audience Insights */}
        {ageDist || locations ? (
          <section className="mt-12">
            <h2 className="text-[22px] font-black text-slate-900 tracking-tight">Audience Insights</h2>
            <div className="mt-6 rounded-[2.5rem] bg-white p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] border border-slate-50">
              {ageDist && (
                <>
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Age Distribution</p>
                  <div className="mt-6 space-y-5">
                    {Object.entries(ageDist).map(([label, value]: [string, any]) => (
                      <div key={label}>
                        <div className="mb-2 flex justify-between text-[13px] font-black">
                          <span className="text-slate-800">{label}</span>
                          <span className="text-[#4F46E5]">{value}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-50">
                          <div className="h-2.5 rounded-full bg-[#4F46E5]" style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {locations && (
                <>
                  <p className="mt-10 text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Top Locations</p>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {Object.entries(locations).map(([country, pct]: [string, any]) => (
                      <div key={country} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100/50">
                        <div className="w-8 h-8 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-xs font-bold">
                          {country[0]}
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-slate-900">{country}</p>
                          <p className="text-[11px] font-bold text-slate-400">{pct}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        ) : (
          <section className="mt-12">
            <h2 className="text-[22px] font-black text-slate-900 tracking-tight">Audience Insights</h2>
            <div className="mt-6 rounded-[2.5rem] bg-white p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] border border-slate-50 text-center">
              <p className="text-sm font-medium text-slate-400">Not enough data yet — keep growing your audience</p>
            </div>
          </section>
        )}

        {/* Top Posts */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-black text-slate-900 tracking-tight">Top Posts</h2>
          </div>
          {contentItems.length > 0 ? (
            <div className="mt-6 grid grid-cols-3 gap-4">
              {contentItems.slice(0, 3).map((item: any, index: number) => (
                <a
                  key={item.id || index}
                  href={item.permalink || "#"}
                  target={item.permalink ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-slate-200 shadow-sm block"
                >
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold uppercase">
                    {item.media_type || "Post"}
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    <span className="text-[11px] font-black text-white drop-shadow-md">{item.platform || "Post"}</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[2.5rem] bg-white p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] border border-slate-50 text-center">
              <p className="text-sm font-medium text-slate-400">No content synced yet</p>
            </div>
          )}
        </section>

        {/* Similar Creators */}
        {similar.length > 0 && (
          <section className="mt-12 pb-20">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-black leading-tight text-slate-900 tracking-tight">Similar Creators</h2>
                <p className="mt-1.5 max-w-[280px] text-[15px] font-medium leading-snug text-slate-500">
                  Recommended based on audience overlap and content style.
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 no-scrollbar">
              {similar.slice(0, 5).map((item: any) => (
                <article key={item.id} className="min-w-[260px] rounded-[2rem] bg-white p-6 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.06)] border border-slate-50 flex flex-col">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-[#4F46E5] flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {(item.full_name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[16px] font-black text-slate-900 leading-tight">{item.full_name}</p>
                      <p className="text-[12px] font-bold text-slate-400 mt-0.5">{item.category || "Creator"}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-[12px] font-bold text-slate-500">
                      Influence Score <span className="font-black text-slate-900 ml-1">{Math.round(item.influence_score || 0)}</span>
                    </p>
                    <div className="mt-2.5 h-2 rounded-full bg-slate-50">
                      <div className="h-2 rounded-full bg-[#4F46E5] shadow-[0_0_8px_rgba(79,70,229,0.3)]" style={{ width: `${Math.min(item.influence_score || 0, 100)}%` }} />
                    </div>
                  </div>
                  <Link
                    href={`/sme/saved-creators/${item.id}`}
                    className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-slate-50 text-[13px] font-black text-slate-900 transition-colors hover:bg-slate-100 border border-slate-100/50"
                  >
                    View Profile
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Hire Button */}
      <div className="fixed bottom-28 lg:bottom-10 left-0 right-0 z-40 px-6">
        <div className="mx-auto max-w-[480px] lg:max-w-5xl lg:px-12">
          <div className="lg:flex lg:justify-end">
            <button
              type="button"
              className="h-16 w-full lg:w-64 rounded-full bg-[#4F46E5] text-[17px] font-black text-white shadow-[0_20px_40px_-15px_rgba(79,70,229,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
            >
              Hire {hireName}
            </button>
          </div>
        </div>
      </div>

      <DashboardBottomNav role={role} activeView="saved" setActiveView={handleSetActiveView} />
    </main>
  );
}
