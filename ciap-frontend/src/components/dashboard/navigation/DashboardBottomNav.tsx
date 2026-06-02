"use client";

import React from "react";

interface BottomNavProps {
  role: string;
  activeView: string;
  setActiveView: (view: string) => void;
}

export function DashboardBottomNav({ role, activeView, setActiveView }: BottomNavProps) {
  const isCreator = role?.toLowerCase() === "creator";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center lg:hidden">
      <div className="w-full bg-white rounded-t-[2rem] shadow-[0_-8px_32px_rgba(0,0,0,0.07)] px-8 py-4 flex items-center justify-between">
        {isCreator ? (
          <>
            <button
              onClick={() => setActiveView("overview")}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeView === 'overview' ? 'bg-[#EEF0FF] text-[#4F46E5]' : 'bg-[#F1F3F6] text-slate-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1.5" /><rect width="7" height="7" x="14" y="3" rx="1.5" /><rect width="7" height="7" x="14" y="14" rx="1.5" /><rect width="7" height="7" x="3" y="14" rx="1.5" /></svg>
            </button>

            <button
              onClick={() => setActiveView("content")}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeView === 'content' ? 'bg-[#EEF0FF] text-[#4F46E5]' : 'bg-[#F1F3F6] text-slate-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /><polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" /></svg>
            </button>

            <button
              onClick={() => setActiveView("audience")}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeView === 'audience' ? 'bg-[#EEF0FF] text-[#4F46E5]' : 'bg-[#F1F3F6] text-slate-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 11c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.34 0-.67.04-.99.1A5.988 5.988 0 0 1 13 7c0 1.65-.67 3.14-1.75 4.22.24.05.49.08.75.08zm-4-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6.62 4.26C17.57 14.23 20 15.5 20 18v2H4v-2c0-2.66 2.43-3.77 4.38-4.74C9.2 13.09 10.08 13 11 13s1.8.09 2.62.26c.26.05.52.1.79.15-.27-.05-.53-.1-.79-.15z" /></svg>
            </button>

            <button
              onClick={() => setActiveView("growth")}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeView === 'growth' ? 'bg-[#EEF0FF] text-[#4F46E5]' : 'bg-[#F1F3F6] text-slate-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveView("overview")}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeView === 'overview' ? 'bg-[#EEF0FF] text-[#4F46E5]' : 'bg-[#F1F3F6] text-slate-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm11 3a3 3 0 0 1 3 3c0 .59-.17 1.14-.46 1.6l1.88 1.88-1.42 1.42-1.88-1.88c-.46.29-1.01.46-1.6.46a3 3 0 1 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" /></svg>
            </button>

            <button
              onClick={() => setActiveView("discovery")}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeView === 'discovery' ? 'bg-[#EEF0FF] text-[#4F46E5]' : 'bg-[#F1F3F6] text-slate-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>

            <button
              onClick={() => setActiveView("campaigns")}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeView === 'campaigns' ? 'bg-[#EEF0FF] text-[#4F46E5]' : 'bg-[#F1F3F6] text-slate-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" /><line x1="12" y1="9" x2="12" y2="12" /><path d="M12 12h-6v3" /><path d="M12 12h6v3" /></svg>
            </button>

            <button
              onClick={() => setActiveView("saved")}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeView === 'saved' ? 'bg-[#EEF0FF] text-[#4F46E5]' : 'bg-[#F1F3F6] text-slate-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
