"use client";

import { useState, useEffect } from "react";
import { DashboardNavbar } from "../DashboardNavbar";
import { DashboardGreeting } from "../DashboardGreeting";
import { StatBar } from "../StatBar";
import { AudienceGrowthChart } from "../AudienceGrowthChart";
import { apiService } from "@/services/api";

interface AudienceViewProps {
  userName: string;
  audienceTimeTab: string;
  setAudienceTimeTab: (val: string) => void;
  activeDateRange: string;
  isDateMenuOpen: boolean;
  dateRanges: string[];
  onToggleDateMenu: () => void;
  onSelectDateRange: (range: string) => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", NG: "🇳🇬", GH: "🇬🇭",
  ZA: "🇿🇦", KE: "🇰🇪", FR: "🇫🇷", DE: "🇩🇪", IN: "🇮🇳",
  BR: "🇧🇷", AU: "🇦🇺", JP: "🇯🇵", MX: "🇲🇽", EG: "🇪🇬",
};

const AGE_LABELS: Record<string, string> = {
  "13-17": "13-17",
  "18-24": "18-24",
  "25-34": "25-34",
  "35-44": "35-44",
  "45-54": "45-54",
  "55-64": "55-64",
  "65+": "65+",
};

export function AudienceView({
  userName,
  audienceTimeTab,
  setAudienceTimeTab,
  activeDateRange,
  isDateMenuOpen,
  dateRanges,
  onToggleDateMenu,
  onSelectDateRange,
}: AudienceViewProps) {
  const [audience, setAudience] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await apiService.fetchCreatorAudience();
        const base = result.data?.audience || {};
        setAudience({ ...base, growth_data: result.data?.growth_data || [] });
      } catch {
        setAudience(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-0 animate-in fade-in duration-500">
        <DashboardNavbar
          desktopTitle="Audience"
          mobileTitle="Audience"
          mobileIcon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          }
          activeDateRange={activeDateRange}
          isDateMenuOpen={isDateMenuOpen}
          dateRanges={dateRanges}
          onToggleDateMenu={onToggleDateMenu}
          onSelectDateRange={onSelectDateRange}
        />
        <div className="lg:px-12 pb-10">
          <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  const ageDist = audience?.age_distribution || {};
  const genderDist = audience?.gender_distribution || {};
  const locDist = audience?.location_distribution || {};

  const topAges = (Object.entries(ageDist) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const ageTotal = topAges.reduce((s, [, v]) => s + v, 0);

  const topCountries = (Object.entries(locDist) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const isFemale = (genderDist.female || 0) > (genderDist.male || 0);

  return (
    <div className="space-y-0 animate-in fade-in duration-500">
      <DashboardNavbar
        desktopTitle="Audience"
        mobileTitle="Audience"
        mobileIcon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
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
          tabs={["Last 30 Days", "90 Days", "6 Months"]}
        />

        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-black text-slate-900 tracking-tight">Audience Snapshot</h2>
            {Object.keys(genderDist).length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#F0F2FF] px-3 py-1.5 rounded-xl">
                <span className="text-[12px] font-black text-[#4F46E5]">
                  {isFemale ? "More Female" : "More Male"} ({Math.round(Math.max(genderDist.female || 0, genderDist.male || 0))}%)
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] border border-slate-50">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Age Range</p>
              {topAges.length > 0 ? (
                <div className="space-y-5">
                  {topAges.map(([label, value]) => (
                    <StatBar
                      key={label}
                      bare
                      label={AGE_LABELS[label] || label}
                      percentage={Math.round((value / ageTotal) * 100)}
                      value={`${Math.round(value)}%`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-medium py-8 text-center">Not enough data yet — keep growing your audience</p>
              )}
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] border border-slate-50">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Top Countries</p>
              {topCountries.length > 0 ? (
                <div className="space-y-4">
                  {topCountries.map(([code, pct]) => (
                    <div key={code} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl leading-none">{COUNTRY_FLAGS[code] || "🌍"}</span>
                        <span className="text-[14px] font-bold text-slate-800">{code}</span>
                      </div>
                      <span className="text-[14px] font-black text-[#4F46E5]">{pct}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-medium py-8 text-center">Not enough data yet — keep growing your audience</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[22px] font-black text-slate-900 tracking-tight mb-5">Audience Growth</h2>
          <div className="bg-white rounded-[2rem] p-7 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] border border-slate-50">
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-[44px] font-black text-slate-900 tracking-tight leading-none">
                  {audience?.subscriber_count
                    ? (audience.subscriber_count >= 1000000
                        ? `${(audience.subscriber_count / 1000000).toFixed(1)}M`
                        : audience.subscriber_count >= 1000
                          ? `${(audience.subscriber_count / 1000).toFixed(1)}K`
                          : audience.subscriber_count)
                    : "—"}
                </span>
              </div>
              <p className="text-[13px] text-slate-400 font-medium mt-1">Current subscribers</p>
            </div>
            {audience?.growth_data?.length ? (
              <AudienceGrowthChart data={audience.growth_data} />
            ) : (
              <div className="flex items-center justify-center h-52 lg:h-64 text-slate-400 text-sm font-medium">
                Not enough data yet — keep growing your audience
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
