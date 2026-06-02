"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardNavbar } from "../DashboardNavbar";
import { apiService } from "@/services/api";
import { toast } from "sonner";

interface CampaignsViewProps {
  forecasterGoal: string;
  setForecasterGoal: (val: string) => void;
  forecasterBudget: number;
  setForecasterBudget: (val: number) => void;
  forecasterDuration: string;
  setForecasterDuration: (val: string) => void;
  forecasterCreatorMode: string;
  setForecasterCreatorMode: (val: string) => void;
  activeDateRange: string;
  isDateMenuOpen: boolean;
  dateRanges: string[];
  onToggleDateMenu: () => void;
  onSelectDateRange: (range: string) => void;
}

interface Creator {
  id: string;
  full_name: string;
  category?: string;
  followers?: number;
  influence_score?: number;
}

interface Forecast {
  predicted_reach: number;
  predicted_engagement: number;
  predicted_conversions: number;
  predicted_roi: number;
  confidence_score: number;
  details: { goal: string; budget: number; duration_days: number };
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "k";
  return String(n);
}

function formatRange(low: number, high: number): string {
  return `${formatCompact(low)}–${formatCompact(high)}`;
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return "₦" + (amount / 1_000_000).toFixed(1) + "M";
  if (amount >= 1_000) return "₦" + (amount / 1_000).toFixed(1) + "K";
  return "₦" + String(amount);
}

const GOAL_MAP: Record<string, string> = {
  "Brand Awareness": "awareness",
  "Engagement": "engagement",
  "Sales/Conversion": "conversion",
};

const DURATION_MAP: Record<string, number> = {
  "7 Days": 7,
  "14 Days": 14,
  "30 Days": 30,
  "Custom": 14,
};

function computeForecast(
  creator: Creator | null | undefined,
  goal: string,
  budget: number,
  days: number,
): Forecast {
  const influence = creator?.influence_score ?? 50;
  const followers = creator?.followers ?? 0;
  const reachBase = Math.max(followers * 1.5, 100);
  const budgetFactor = Math.max(budget / 100_000, 1);
  const durationFactor = Math.max(days / 7, 1);

  const predictedReach = Math.round(
    reachBase * (1 + influence / 200) * Math.pow(budgetFactor, 0.25),
  );

  const engagementRate = 0.05 + (influence / 100) * 0.1;
  const predictedEngagement = Math.round(predictedReach * Math.max(engagementRate, 0.03));

  const goalMultiplier = goal === "conversion" || goal === "roi" ? 1.2 : 1;
  const predictedConversions = Math.max(1, Math.round(predictedEngagement * 0.02 * goalMultiplier));

  const predictedRoi = Number(
    ((predictedConversions * 1000) / Math.max(budget, 1)).toFixed(2),
  );
  const confidence = Number(
    Math.min(0.95, 0.45 + influence / 200 + Math.min(durationFactor, 3) * 0.05).toFixed(2),
  );

  return {
    predicted_reach: predictedReach,
    predicted_engagement: predictedEngagement,
    predicted_conversions: predictedConversions,
    predicted_roi: predictedRoi,
    confidence_score: confidence,
    details: { goal, budget, duration_days: days },
  };
}

export function CampaignsView({
  forecasterGoal,
  setForecasterGoal,
  forecasterBudget,
  setForecasterBudget,
  forecasterDuration,
  setForecasterDuration,
  forecasterCreatorMode,
  setForecasterCreatorMode,
  activeDateRange,
  isDateMenuOpen,
  dateRanges,
  onToggleDateMenu,
  onSelectDateRange,
}: CampaignsViewProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiService.fetchCreators({ limit: 6, min_score: 0 }).then((res) => {
      const items: Creator[] = res?.data?.items || [];
      setCreators(items);
      if (items.length > 0 && !selectedCreatorId) {
        setSelectedCreatorId(items[0].id);
      }
    }).catch((e) => console.error("Failed to fetch creators:", e));
  }, []);

  const selectedCreator = useMemo(
    () => creators.find((c) => c.id === selectedCreatorId) || null,
    [creators, selectedCreatorId],
  );

  const forecast = useMemo(() => {
    if (!selectedCreator) return null;
    const goal = GOAL_MAP[forecasterGoal] || "awareness";
    const days = DURATION_MAP[forecasterDuration] || 14;
    return computeForecast(selectedCreator, goal, forecasterBudget, days);
  }, [selectedCreator, forecasterGoal, forecasterBudget, forecasterDuration]);

  async function handleCreate() {
    setCreating(true);
    try {
      const goal = GOAL_MAP[forecasterGoal] || "awareness";
      const days = DURATION_MAP[forecasterDuration] || 14;
      const today = new Date();
      const end = new Date(today);
      end.setDate(end.getDate() + days);

      const name = `${forecasterGoal} Campaign — ${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      await apiService.createCampaign({
        name,
        goal,
        budget: forecasterBudget,
        start_date: today.toISOString().split("T")[0],
        end_date: end.toISOString().split("T")[0],
      });
      toast.success("Campaign created successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Campaign creation failed");
    } finally {
      setCreating(false);
    }
  }

  const reachLow = forecast ? Math.round(forecast.predicted_reach * 0.7) : 0;
  const reachHigh = forecast ? Math.round(forecast.predicted_reach * 1.3) : 0;
  const engagementPct = forecast && forecast.predicted_reach > 0
    ? ((forecast.predicted_engagement / forecast.predicted_reach) * 100).toFixed(1)
    : "0.0";
  const cpc = forecast && forecast.predicted_engagement > 0
    ? Math.round(forecast.details.budget / forecast.predicted_engagement)
    : 0;

  return (
    <div className="space-y-0 animate-in fade-in duration-500">
      <DashboardNavbar
        desktopTitle="Campaign Forecaster"
        mobileTitle="Forecaster"
        mobileIcon={
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" /><line x1="12" y1="9" x2="12" y2="12" /><path d="M12 12h-6v3" /><path d="M12 12h6v3" /></svg>
        }
        activeDateRange={activeDateRange}
        isDateMenuOpen={isDateMenuOpen}
        dateRanges={dateRanges}
        onToggleDateMenu={onToggleDateMenu}
        onSelectDateRange={onSelectDateRange}
      />

      <div className="lg:px-12 pb-10">
        <div className="flex justify-between items-center mb-8 lg:hidden">
          <div>
            <h2 className="text-[22px] font-black text-slate-900 leading-tight">Campaign Forecaster</h2>
            <p className="text-[12px] text-slate-500 font-medium mt-1">Estimate reach, engagement, and conversion</p>
          </div>
        </div>

        <div className="space-y-10">
          {/* ── CAMPAIGN GOAL ─────────────────────────── */}
          <section>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Campaign Goal</h3>
              <span className="text-[9px] font-black text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-md uppercase tracking-wider">Select One</span>
            </div>
            <div className="space-y-3">
              {[
                { id: "Brand Awareness", desc: "Maximize unique reach and impressions." },
                { id: "Engagement", desc: "Focus on likes, comments, and shares." },
                { id: "Sales/Conversion", desc: "Drive traffic and direct purchases." }
              ].map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setForecasterGoal(goal.id)}
                  className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all ${forecasterGoal === goal.id
                    ? "bg-[#4F46E5] border-[#4F46E5] text-white shadow-[0_12px_40px_-10px_rgba(79,70,229,0.4)]"
                    : "bg-white border-transparent text-slate-900 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] hover:border-slate-100"
                    }`}
                >
                  <p className="text-[17px] font-black mb-1">{goal.id}</p>
                  <p className={`text-[12px] font-medium ${forecasterGoal === goal.id ? "text-white/80" : "text-slate-400"}`}>
                    {goal.desc}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* ── BUDGET ────────────────────────────────── */}
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Budget (₦)</h3>
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] border border-slate-50">
              <div className="flex justify-between items-center mb-8">
                <p className="text-[32px] font-black text-slate-900 tracking-tight">₦{forecasterBudget.toLocaleString()}</p>
                <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
              </div>
              <input
                type="range" min="50000" max="1000000" step="10000"
                value={forecasterBudget}
                onChange={(e) => setForecasterBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#4F46E5] mb-8"
              />
              <div className="grid grid-cols-4 gap-3">
                {[50000, 100000, 250000, 500000].map((b) => (
                  <button
                    key={b}
                    onClick={() => setForecasterBudget(b)}
                    className={`py-2.5 rounded-xl text-[11px] font-black tracking-wider transition-all ${forecasterBudget === b ? "bg-[#4F46E5] text-white" : "bg-white border border-slate-100 text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    ₦{(b / 1000)}K
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── CAMPAIGN DURATION ─────────────────────── */}
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Campaign Duration</h3>
            <div className="grid grid-cols-2 gap-4">
              {["7 Days", "14 Days", "30 Days", "Custom"].map((d) => (
                <button
                  key={d}
                  onClick={() => setForecasterDuration(d)}
                  className={`py-5 rounded-2xl text-[14px] font-black transition-all ${forecasterDuration === d
                    ? "bg-[#EEF0FF] border-2 border-[#4F46E5] text-[#4F46E5]"
                    : "bg-white border-2 border-transparent text-slate-500 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)]"
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </section>

          {/* ── CREATOR SELECTION ──────────────────────── */}
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Creator Selection</h3>
            <div className="bg-slate-100 p-1 rounded-2xl flex mb-6">
              {["Mixed", "One"].map((m) => (
                <button
                  key={m}
                  onClick={() => setForecasterCreatorMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all ${forecasterCreatorMode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] border border-slate-50">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {creators.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-slate-400 text-sm font-medium">
                    No creators available yet
                  </div>
                )}
                {creators.map((c) => {
                  const selected = forecasterCreatorMode === "One" && selectedCreatorId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCreatorId(c.id);
                        if (forecasterCreatorMode === "Mixed") setForecasterCreatorMode("One");
                      }}
                      className={`rounded-2xl p-3 flex items-center gap-3 text-left transition-all ${selected
                        ? "bg-[#EEF0FF] ring-2 ring-[#4F46E5]"
                        : "bg-slate-50 hover:bg-slate-100"
                        }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(c.full_name || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-900 truncate">{c.full_name || "Creator"}</p>
                        <p className="text-[9px] font-bold text-[#4F46E5]">
                          {c.influence_score ? `Score ${Math.round(c.influence_score)}` : "—"}
                          {c.followers ? ` · ${formatCompact(c.followers)}` : ""}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── ESTIMATED PERFORMANCE ─────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-[19px] font-black text-slate-900 tracking-tight">Estimated Performance</h3>
              {forecast && forecast.confidence_score >= 0.5 && (
                <span className="text-[9px] font-black text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></span>
                  High Confidence
                </span>
              )}
            </div>

            {forecast ? (
              <>
                <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Expected Reach</p>
                    <p className="text-[22px] font-black text-slate-900 tracking-tight">{formatRange(reachLow, reachHigh)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Engagement Rate</p>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-[22px] font-black text-[#4F46E5] tracking-tight">{engagementPct}%</p>
                      <span className="text-[10px] font-bold text-slate-400 italic">avg.</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Expected Conversions</p>
                    <p className="text-[22px] font-black text-slate-900 tracking-tight">{formatCompact(forecast.predicted_conversions)}+</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cost Per Click</p>
                    <p className="text-[22px] font-black text-slate-900 tracking-tight">{formatCurrency(cpc)}</p>
                  </div>
                </div>

                <div className="mt-10 bg-white rounded-[2.5rem] p-8 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] border border-slate-50">
                  <h4 className="text-[15px] font-black text-slate-900 text-center mb-8">Campaign Funnel Forecast</h4>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-[85%] bg-[#DEDFFF] h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-[#4F46E5]">{formatCompact(Math.round(forecast.predicted_reach * 1.8))} Impressions</div>
                    <div className="w-[70%] bg-[#BCC1F4] h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white">{formatCompact(forecast.predicted_reach)} Unique Reach</div>
                    <div className="w-[50%] bg-[#9198E5] h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white">{formatCompact(forecast.predicted_engagement)} Engagements</div>
                    <div className="w-[35%] bg-[#4F46E5] h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg">{formatCompact(forecast.predicted_conversions)} Conversions</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm font-medium">
                Select a creator to see estimated performance
              </div>
            )}
          </section>

          {/* ── WHY THIS FORECAST ─────────────────────── */}
          {forecast && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                <p className="text-[11px] font-black text-slate-500">Why this forecast?</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {forecast.confidence_score >= 0.5 && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">High confidence forecast</span>
                )}
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                  {forecast.details.duration_days}-day campaign
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                  {formatCurrency(forecast.details.budget)} budget
                </span>
              </div>
            </section>
          )}

          <div className="pt-4">
            <button
              onClick={handleCreate}
              disabled={creating || !selectedCreatorId}
              className="w-full bg-[#4F46E5] text-white text-[15px] font-black rounded-[1.5rem] py-5 hover:bg-[#4338CA] transition-all shadow-[0_12px_40px_-10px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
