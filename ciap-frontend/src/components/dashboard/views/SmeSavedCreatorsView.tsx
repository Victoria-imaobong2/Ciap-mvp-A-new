"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/services/api";

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-4.2-4.2" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7 text-[#4F46E5]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 3.75A2.75 2.75 0 0 1 8.75 1h6.5A2.75 2.75 0 0 1 18 3.75V22l-6-4-6 4V3.75Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.33 4.32c.43-1.76 2.91-1.76 3.34 0a1.73 1.73 0 0 0 2.59 1.05c1.55-.93 3.3.82 2.37 2.37a1.73 1.73 0 0 0 1.05 2.59c1.76.43 1.76 2.91 0 3.34a1.73 1.73 0 0 0-1.05 2.59c.93 1.55-.82 3.3-2.37 2.37a1.73 1.73 0 0 0-2.59 1.05c-.43 1.76-2.91 1.76-3.34 0a1.73 1.73 0 0 0-2.59-1.05c-1.55.93-3.3-.82-2.37-2.37a1.73 1.73 0 0 0-1.05-2.59c-1.76-.43-1.76-2.91 0-3.34a1.73 1.73 0 0 0 1.05-2.59c-.93-1.55.82-3.3 2.37-2.37.99.6 2.28.06 2.59-1.05Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.18V11a6 6 0 0 0-4-5.66V5a2 2 0 1 0-4 0v.34A6 6 0 0 0 6 11v3.18c0 .53-.21 1.04-.59 1.42L4 17h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  );
}

interface CreatorItem {
  id: string;
  full_name: string;
  category?: string | null;
  followers?: number;
  influence_score?: number;
  top_platform?: string | null;
  platform?: string | null;
}

function SavedCreatorCard({ creator }: { creator: CreatorItem }) {
  return (
    <article className="flex h-full flex-col rounded-[1.75rem] bg-white p-8 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)] lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="h-28 w-28 rounded-2xl bg-[#4F46E5] flex items-center justify-center text-white text-4xl font-black lg:h-24 lg:w-24 shrink-0">
          {(creator.full_name || "?")[0].toUpperCase()}
        </div>
        <button
          type="button"
          aria-label={`View ${creator.full_name} profile`}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[#4F46E5] transition-colors hover:bg-[#EEF0FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
        >
          <BookmarkIcon />
        </button>
      </div>

      <div className="mt-9 lg:mt-7">
        <h3 className="text-[25px] font-black leading-tight tracking-tight text-slate-900 lg:text-[21px]">{creator.full_name}</h3>
        <p className="mt-1 text-[18px] font-bold leading-snug text-slate-600 lg:text-[15px]">{creator.category || creator.top_platform || "Creator"}</p>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-slate-100 py-6 text-center lg:gap-2 lg:py-5">
        <div>
          <dt className="mt-2 text-[12px] font-medium uppercase leading-snug text-slate-500 lg:text-[10px]">Followers</dt>
          <dd className="text-[18px] font-black text-slate-900 lg:text-[16px]">{creator.followers?.toLocaleString() || "0"}</dd>
        </div>
        <div>
          <dt className="mt-2 text-[12px] font-medium uppercase leading-snug text-slate-500 lg:text-[10px]">Score</dt>
          <dd className="text-[18px] font-black text-slate-900 lg:text-[16px]">{creator.influence_score ? Math.round(creator.influence_score) : "—"}</dd>
        </div>
        <div>
          <dt className="mt-2 text-[12px] font-medium uppercase leading-snug text-slate-500 lg:text-[10px]">Platform</dt>
          <dd className="text-[18px] font-black text-slate-900 lg:text-[16px]">{creator.top_platform || creator.platform || "—"}</dd>
        </div>
      </dl>

      <Link
        href={`/sme/saved-creators/${creator.id}`}
        className="mt-6 h-14 w-full rounded-full bg-[#4F46E5] text-[17px] font-black text-white shadow-[0_14px_30px_-18px_rgba(79,70,229,0.75)] transition-colors hover:bg-[#4338CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 lg:mt-auto lg:h-12 lg:text-[15px]"
      >
        <span className="flex h-full items-center justify-center">View Profile</span>
      </Link>
    </article>
  );
}

export function SmeSavedCreatorsView() {
  const { user } = useAuth();
  const userName = user?.fullName || user?.email?.split("@")[0] || "User";
  const [query, setQuery] = useState("");
  const [creators, setCreators] = useState<CreatorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.fetchSavedCreators().then((res) => {
      setCreators(res?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredCreators = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return creators;
    return creators.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(normalizedQuery) ||
        c.category?.toLowerCase().includes(normalizedQuery)
    );
  }, [query, creators]);

  return (
    <div className="min-h-screen animate-in fade-in duration-500">
      <header className="-mx-6 bg-[#FAFAFA] px-6 pb-3 pt-10 lg:mx-0 lg:px-12 lg:pt-8">
        <div className="flex items-center justify-between">
          <Image src="/ciap-logo.png" alt="CIAP Logo" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
          <button
            type="button"
            aria-label="Open settings"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
          >
            <SettingsIcon />
          </button>
        </div>

        <div className="mt-14 flex items-end justify-between gap-4 lg:mt-10">
          <div>
            <h2 className="text-[29px] font-black leading-tight tracking-tight text-slate-900 lg:text-3xl">Your Creators Roster</h2>
            <p className="mt-1 text-[16px] font-semibold text-slate-500">Your Saved Profiles</p>
            <div className="mt-4 h-1.5 w-16 rounded-full bg-[#4F46E5]" />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Open notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
            >
              <BellIcon />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-slate-900 ring-2 ring-[#FAFAFA]" />
            </button>
            <button
              type="button"
              aria-label="Open account menu"
              className="h-11 w-11 overflow-hidden rounded-xl bg-[#4F46E5] p-0.5 shadow-sm transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
            >
              <Image
                unoptimized
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}&backgroundColor=1e293b`}
                alt=""
                width={40}
                height={40}
                className="h-full w-full rounded-[0.65rem] bg-slate-900 object-cover"
              />
            </button>
          </div>
        </div>
      </header>

      <div className="lg:px-12">
        <div className="relative mt-5">
          <label htmlFor="saved-creator-search" className="sr-only">Search saved creators</label>
          <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center">
            <SearchIcon />
          </div>
          <input
            id="saved-creator-search"
            type="search"
            placeholder="Search by name, niche, or keyword"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-16 w-full rounded-full border border-transparent bg-slate-100/80 pl-16 pr-6 text-[15px] font-semibold text-slate-900 placeholder:text-slate-500 shadow-[0_22px_50px_-34px_rgba(15,23,42,0.45)] transition-colors focus:border-[#4F46E5]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/25"
          />
        </div>

        <section className="mt-10 space-y-8 pb-28 lg:grid lg:auto-rows-fr lg:grid-cols-2 lg:items-stretch lg:gap-6 lg:space-y-0 xl:grid-cols-3">
          {loading ? (
            <div className="flex items-center justify-center py-20 lg:col-span-2 xl:col-span-3">
              <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredCreators.length > 0 ? (
            filteredCreators.map((creator) => (
              <SavedCreatorCard key={creator.id} creator={creator} />
            ))
          ) : (
            <div className="rounded-[1.75rem] bg-white p-8 text-center shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)] lg:col-span-2 xl:col-span-3">
              <p className="text-[17px] font-black text-slate-900">No saved creators yet</p>
              <p className="mt-2 text-sm font-medium text-slate-500">Discover and save creators to build your roster.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
