"use client";

import React from "react";

interface SidebarProps {
  role: string;
  activeView: string;
  setActiveView: (view: string) => void;
}

export function DashboardSidebar({ role, activeView, setActiveView }: SidebarProps) {
  const isCreator = role?.toLowerCase() === "creator";

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 bg-white border-r border-slate-100 p-8 shadow-[10px_0_40px_-10px_rgba(0,0,0,0.03)] z-50">
      <div className="flex gap-3 items-center mb-12 px-2">
        <img src="/ciap-logo.png" alt="CIAP Logo" className="w-[30px] h-[30px] object-contain rounded-lg" />
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">CIAP</h1>
      </div>
      <nav className="flex flex-col gap-2">
        <button 
          onClick={() => setActiveView("overview")} 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeView === 'overview' ? "bg-[#F0F2FF] text-[#4F46E5]" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1.5" /><rect width="7" height="7" x="14" y="3" rx="1.5" /><rect width="7" height="7" x="14" y="14" rx="1.5" /><rect width="7" height="7" x="3" y="14" rx="1.5" /></svg>
          Overview
        </button>
        <button 
          onClick={() => setActiveView(isCreator ? "content" : "discovery")} 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeView === (isCreator ? 'content' : 'discovery') ? "bg-[#F0F2FF] text-[#4F46E5]" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}
        >
          {isCreator ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /><polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          )}
          {isCreator ? 'Content' : 'Discovery'}
        </button>
        <button 
          onClick={() => setActiveView(isCreator ? "audience" : "campaigns")} 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeView === (isCreator ? 'audience' : 'campaigns') ? "bg-[#F0F2FF] text-[#4F46E5]" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}
        >
          {isCreator ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 11c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.34 0-.67.04-.99.1A5.988 5.988 0 0 1 13 7c0 1.65-.67 3.14-1.75 4.22.24.05.49.08.75.08zm-4-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6.62 4.26C17.57 14.23 20 15.5 20 18v2H4v-2c0-2.66 2.43-3.77 4.38-4.74C9.2 13.09 10.08 13 11 13s1.8.09 2.62.26c.26.05.52.1.79.15-.27-.05-.53-.1-.79-.15z" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" /><line x1="12" y1="9" x2="12" y2="12" /><path d="M12 12h-6v3" /><path d="M12 12h6v3" /></svg>
          )}
          {isCreator ? 'Audience' : 'Campaigns'}
        </button>
        <button 
          onClick={() => setActiveView(isCreator ? "growth" : "saved")} 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeView === (isCreator ? 'growth' : 'saved') ? "bg-[#F0F2FF] text-[#4F46E5]" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}
        >
          {isCreator ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          )}
          {isCreator ? 'Growth' : 'Saved'}
        </button>
      </nav>
    </aside>
  );
}
