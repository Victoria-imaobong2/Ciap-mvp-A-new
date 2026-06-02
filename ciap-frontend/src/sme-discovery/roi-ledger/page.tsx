"use client";

import React, { useEffect, useState } from 'react';
import { StatBar } from '@/components/dashboard/StatBar';
//import { PerformanceChart } from '@/components/dashboard/PerformanceChart'; 

export default function RoiLedgerPage() {
  // 1. State management
  const [metrics, setMetrics] = useState({
    totalSpend: "$128.4k",
    totalReach: "4.2M",
    engagement: "842k",
    roi: "3.2x"
  });

  // 2. The SAFE useEffect
  useEffect(() => {
    const loadData = async () => {
      // This is where you will eventually call smeService.ts
      console.log("Fetching ROI data safely...");
    };
    loadData();
  }, []); // The empty array ensures we don't spam the DB

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#F8F9FC] min-h-screen pb-24">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Quarterly Overview</h1>
        <p className="text-sm text-slate-500">Summary of 14 active campaigns.</p>
      </header>

      {/* Stats Grid */}
      <section className="flex flex-col gap-4">
        <StatBar label="TOTAL SPEND" value={metrics.totalSpend} trend="+4.2%" percentage={42} />
        <StatBar label="TOTAL REACH" value={metrics.totalReach} trend="-12.3%" percentage={12.3} />
        <StatBar label="ENGAGEMENT" value={metrics.engagement} trend="-0.4%" percentage={88}/>
        
        {/* ROI Highlight Card */}
        <div className="bg-[#4F46E5] text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-bold opacity-70 tracking-widest">TOTAL ROI</p>
          <div className="flex justify-between items-end mt-4">
            <h2 className="text-5xl font-bold">{metrics.roi}</h2>
            <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-semibold">
              Top 5%
            </span>
          </div>
        </div>
      </section>

      {/* Chart Section Placeholder */}
      <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800">Performance Trend</h3>
          <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-lg text-slate-500 font-bold">
            Last 30 Days
          </span>
        </div>
        <div className="h-48 w-full bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
          <p className="text-slate-400 text-xs italic text-center px-10">
            Install Recharts to render the wavy line from your design
          </p>
        </div>
      </section>

      {/* Action Button */}
      <button className="w-full py-5 bg-[#4F46E5] text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-transform">
        Export Report ↑
      </button>
    </div>
  );
}