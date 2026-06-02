import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface DashboardNavbarProps {
  /** Title shown in the desktop sticky bar */
  desktopTitle: string;
  /** Title shown in the mobile sub-header */
  mobileTitle: string;
  /** Icon rendered next to the mobile title (pass a JSX element) */
  mobileIcon: React.ReactNode;
  activeDateRange: string;
  isDateMenuOpen: boolean;
  dateRanges: string[];
  onToggleDateMenu: () => void;
  onSelectDateRange: (range: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export function DashboardNavbar({
  desktopTitle,
  mobileTitle,
  mobileIcon,
  activeDateRange,
  isDateMenuOpen,
  dateRanges,
  onToggleDateMenu,
  onSelectDateRange,
  onSync,
  isSyncing,
}: DashboardNavbarProps) {
  const { logout, user } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userName = user?.fullName || user?.email?.split('@')[0] || "User";
  return (
    <>
      {/* ── STICKY TOP BAR ──────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white lg:shadow-[0_4px_20px_rgba(0,0,0,0.02)] pt-12 lg:pt-8 pb-4 lg:pb-6 -mx-6 lg:mx-0 px-6 lg:px-12 mb-0 lg:mb-10 lg:rounded-b-[2rem] lg:border lg:border-slate-50">
        <div className="flex justify-between items-center px-1 lg:px-0">
          {/* Mobile: Logo */}
          <img src="/ciap-logo.png" alt="CIAP Logo" className="w-[30px] h-[30px] object-contain rounded-lg lg:hidden" />

          {/* Desktop: page title */}
          <h2 className="hidden lg:block text-2xl font-black text-slate-900 tracking-tight">
            {desktopTitle}
          </h2>

          {/* Right actions */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Date range — desktop only */}
            <div className="relative">
              <button
                onClick={onToggleDateMenu}
                className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 hover:bg-slate-100 transition-colors"
              >
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  {activeDateRange}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDateMenuOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDateMenuOpen && (
                <div className="hidden lg:block absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50">
                  {dateRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => onSelectDateRange(range)}
                      className={`w-full text-left px-5 py-2.5 text-[11px] uppercase tracking-widest font-bold transition-colors ${
                        activeDateRange === range
                          ? "text-[#4F46E5] bg-slate-50"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sync icon */}
            <svg
              onClick={onSync}
              className={`w-5 h-5 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors ${isSyncing ? "animate-spin" : ""}`}
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>

            {/* Settings icon */}
            <svg
              className="w-5 h-5 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>

            {/* Avatar — desktop only */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="hidden lg:block w-9 h-9 rounded-xl bg-slate-900 overflow-hidden shadow-sm hover:ring-2 hover:ring-indigo-100 transition-all"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=1e293b`}
                  alt="avatar"
                />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="hidden lg:block absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 py-3 z-50 animate-in fade-in zoom-in duration-200">
                  <div className="px-5 py-3 mb-2 border-b border-slate-50">
                    <p className="text-[12px] font-black text-slate-900 truncate">{userName}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {}}
                    className="w-full text-left px-5 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-5 py-2.5 text-[12px] font-black text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE SUB-HEADER ────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-10 mt-0 lg:hidden px-6 py-4 bg-transparent -mx-6">
        {/* Left: icon + title + date dropdown */}
        <div className="flex gap-3 items-center">
          {mobileIcon}
          <div>
            <h2 className="text-[19px] font-black text-slate-900 leading-tight tracking-tight">
              {mobileTitle}
            </h2>
            <div className="relative inline-block mt-0.5">
              <button
                onClick={onToggleDateMenu}
                className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-slate-600 transition-colors"
              >
                {activeDateRange}
                <svg
                  className={`w-3 h-3 transition-transform ${isDateMenuOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDateMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50">
                  {dateRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => onSelectDateRange(range)}
                      className={`w-full text-left px-5 py-2.5 text-[11px] uppercase tracking-widest font-bold transition-colors ${
                        activeDateRange === range
                          ? "text-[#4F46E5] bg-slate-50"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: sync + bell + avatar */}
        <div className="flex gap-4 items-center">
          <svg
            onClick={onSync}
            className={`w-5 h-5 text-slate-900 cursor-pointer ${isSyncing ? "animate-spin" : ""}`}
            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div className="relative">
            <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="absolute top-0 right-0 w-2 h-2 bg-slate-900 rounded-full border-2 border-[#FAFAFA]" />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-9 h-9 rounded-xl bg-slate-900 overflow-hidden shadow-sm active:scale-95 transition-transform"
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=1e293b`}
                alt="avatar"
              />
            </button>

            {/* Mobile User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-5 py-3 text-[13px] font-black text-red-500 active:bg-red-50 transition-colors"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
