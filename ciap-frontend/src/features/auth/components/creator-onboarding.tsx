"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

type OnboardingStep = 1 | 2 | 3 | 4;

export function CreatorOnboarding() {
  const { updateOnboardingStatus } = useAuth();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const result = await apiService.fetchConnectedPlatforms();
        const platformNames = result.data.items.map((p: any) => p.platform.toLowerCase());
        console.log("Connected platforms fetched:", platformNames);
        setConnectedPlatforms(platformNames);
        
        if (platformNames.length > 0) {
          setStep(2);
        }
      } catch (err) {
        console.error("Failed to fetch connected platforms", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleNext = async () => {
    if (step === 3) {
      // Trigger final sync before moving to dashboard
      try {
        await apiService.syncPlatforms();
      } catch (err) {
        console.error("Sync failed", err);
      }
    }
    
    if (step < 4) setStep((step + 1) as OnboardingStep);
    else {
      updateOnboardingStatus(true);
      router.push("/?role=creator");
    }
  };

  const handleConnect = async (platform: string) => {
    try {
      const result = await apiService.getConnectUrl(platform.toLowerCase());
      if (result.data?.auth_url) {
        window.location.href = result.data.auth_url;
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to connect to ${platform}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Progress Bar Header */}
      <div className="mb-10 w-full max-w-[280px] space-y-4">
        <div className="flex justify-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
          Step {step === 4 ? 3 : step} of 3
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                (step === 4 ? 3 : step) >= s ? "bg-slate-900" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content Area - Elements are stacked but NOT all in one card */}
      <div className="w-full max-w-[480px] space-y-6 flex flex-col items-center">
        
        {/* Main Content Card (Icon + Text + Cards) */}
        <div className="w-full rounded-[4rem] bg-white px-8 py-14 shadow-[0_32px_96px_-12px_rgba(0,0,0,0.06)] sm:px-14">
          {step === 1 && <StepOneContent />}
          {step === 2 && <StepTwoContent onConnect={handleConnect} connected={connectedPlatforms} />}
          {step === 3 && <StepThreeContent onNext={handleNext} />}
          {step === 4 && <StepFourContent connected={connectedPlatforms} />}
        </div>

        {/* Info Box - Floating OUTSIDE the main card */}
        {(step === 1 || step === 2) && <InfoBox />}

        {/* Sync Speed Box - Floating OUTSIDE for Step 4 */}
        {step === 4 && <SyncSpeedBox />}

        {/* Action Button - Floating OUTSIDE the main card */}
        <div className="w-full">
           {step === 1 && <ActionButton label="Continue to Selection" onClick={handleNext} showArrow={true} color="bg-[#4F46E5] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)]" />}
           {step === 2 && <ActionButton label="Continue" onClick={handleNext} showArrow={false} color={connectedPlatforms.length > 0 ? "bg-[#414141] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]" : "bg-[#414141] opacity-40 cursor-not-allowed"} />}
           {step === 3 && <ActionButton label="Continue" onClick={() => {}} showArrow={false} color="bg-[#414141] opacity-40 cursor-not-allowed" />}
           {step === 4 && <ActionButton label="Go to Dashboard" onClick={handleNext} showArrow={true} color="bg-[#414141] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]" />}
        </div>
        
        {/* Sub-footer (Now clearer and always visible) */}
        <div className="text-center pt-2 pb-8">
          <p className="text-[13px] font-bold text-slate-500/80">
            Read-only access. Your data remains yours.
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, showArrow, color }: { label: string; onClick: () => void; showArrow: boolean; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`group flex h-[84px] w-full items-center justify-center gap-3 rounded-[2.5rem] text-[19px] font-black text-white transition-all active:scale-[0.98] ${color}`}
    >
      {label}
      {showArrow && <ArrowRightIcon className="h-6 w-6 transition-transform group-hover:translate-x-1.5" />}
    </button>
  );
}

function InfoBox() {
  return (
    <div className="w-full rounded-[1.5rem] bg-[#F1F3F5] p-7 flex items-center gap-4">
      <div className="flex h-6 w-6 items-center justify-center flex-shrink-0">
        <ShieldCheckIcon className="h-5 w-5 text-slate-900" />
      </div>
      <p className="text-[14px] font-bold leading-tight text-slate-500/90">
        Your login credentials are never shared with us directly.
      </p>
    </div>
  );
}

function SyncSpeedBox() {
  return (
    <div className="w-full rounded-[3.5rem] bg-white p-10 text-center shadow-[0_32px_96px_-12px_rgba(0,0,0,0.06)]">
       <div className="space-y-1 mb-6">
          <p className="text-[44px] font-black text-slate-900 tracking-tighter">1.2s</p>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Sync Speed</p>
       </div>
       <div className="h-1 w-full bg-slate-900 rounded-full mb-6" />
       <p className="text-[13px] font-bold text-slate-400 italic">Your creative insights, now unified.</p>
    </div>
  );
}

function StepOneContent() {
  return (
    <div className="flex flex-col items-center">
      {/* Premium Network Icon from Design */}
      <div className="relative mb-16 h-48 w-48 flex items-center justify-center">
         <div className="absolute top-4 left-4 h-32 w-32 bg-[#FFC5C5] rounded-[2.5rem] opacity-60 blur-sm" />
         <div className="absolute top-4 right-4 h-32 w-32 bg-[#E1D4FF] rounded-[2.5rem] opacity-60 blur-sm" />
         <div className="absolute bottom-4 left-4 h-32 w-32 bg-[#C2C2C2] rounded-[2.5rem] opacity-60 blur-sm" />
         <div className="absolute bottom-4 right-4 h-32 w-32 bg-[#D9D9FF] rounded-[2.5rem] opacity-60 blur-sm" />
         
         <div className="relative bg-white h-36 w-36 rounded-[2.8rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] flex items-center justify-center border border-white">
            <div className="flex flex-col items-center gap-1">
               <div className="flex gap-2">
                  <div className="h-4 w-4 rounded-full bg-[#4F46E5]" />
                  <div className="h-4 w-4 rounded-full bg-[#4F46E5] mt-4" />
               </div>
               <div className="flex gap-4 items-center">
                  <div className="h-4 w-4 rounded-full bg-[#4F46E5]" />
                  <div className="h-6 w-6 rounded-full bg-[#4F46E5]" />
                  <div className="h-4 w-4 rounded-full bg-[#4F46E5]" />
               </div>
               <div className="flex gap-2">
                  <div className="h-4 w-4 rounded-full bg-[#4F46E5] mb-4" />
                  <div className="h-4 w-4 rounded-full bg-[#4F46E5]" />
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-4 text-center mb-12">
        <h1 className="text-[40px] font-black tracking-tight text-slate-900 leading-[1.1]">
          Unlock Your<br />Performance Insights
        </h1>
        <p className="text-[17px] font-bold text-slate-400/80 leading-relaxed max-w-[280px] mx-auto">
          Connect your platforms to see your unified reach and influence score in real-time.
        </p>
      </div>

      <div className="flex gap-4 w-full justify-center">
        {[
          { label: "Read-Only", icon: EyeIcon },
          { label: "Encrypted", icon: LockIcon },
          { label: "Owner-First", icon: ToggleIcon },
        ].map((f) => (
          <div key={f.label} className="relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full z-10 shadow-md border border-slate-50">
               <f.icon className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="bg-[#414141] h-24 w-28 rounded-[2rem] flex items-center justify-center shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)]">
               <span className="text-[11px] font-black text-white uppercase tracking-wider">{f.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepTwoContent({ onConnect, connected }: { onConnect: (platform: string) => void, connected: string[] }) {
  const platforms = [
    { id: "YouTube", recommended: true, icon: "Y", color: "text-red-500" },
    { id: "Instagram", icon: "I", color: "text-pink-500" },
    { id: "TikTok", icon: "T", color: "text-slate-900" },
    { id: "Twitter/X", icon: "X", color: "text-blue-400" },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* ... header ... */}
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-[40px] font-black tracking-tight text-slate-900 leading-[1.1]">
          Connect your<br />platforms
        </h1>
        <p className="text-[17px] font-bold text-slate-400/80 leading-relaxed max-w-[320px] mx-auto">
          We&apos;ll sync your data to generate detailed creator insights and audience analytics.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 w-full">
        {platforms.map((p) => {
          const isConnected = connected.some(c => c.toLowerCase() === p.id.toLowerCase());
          return (
            <div
              key={p.id}
              onClick={() => !isConnected && onConnect(p.id)}
              className={`relative flex flex-col p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${
                isConnected 
                  ? "border-[#4F46E5] bg-white shadow-sm" 
                  : "border-slate-50 bg-[#F9FAFB] hover:border-indigo-100"
              }`}
            >
              {p.recommended && (
                <div className="absolute top-5 left-5 bg-[#E2E8F0] px-2.5 py-1 rounded-lg">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Recommended</span>
                </div>
              )}
              
              <div className={`mt-6 h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl font-bold ${p.color}`}>
                {p.icon}
              </div>

              <div className="mt-6">
                <p className="text-[18px] font-black text-slate-900">{p.id}</p>
                {isConnected ? (
                  <p className="text-[13px] text-slate-400 font-bold mt-1">Connected</p>
                ) : (
                  <button className="text-[11px] font-black text-slate-400/60 uppercase tracking-[0.15em] mt-6 flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    Connect +
                  </button>
                )}
              </div>

              {isConnected && (
                <div className="mt-6 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                  <span className="text-[11px] font-black text-[#10B981] uppercase tracking-widest">Active</span>
                  <CheckCircleIcon className="h-5 w-5 text-[#10B981] ml-auto" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepThreeContent({ onNext }: { onNext: () => void }) {
  const [status, setStatus] = useState<"fetching" | "analyzing" | "preparing">("fetching");

  useEffect(() => {
    const timer1 = setTimeout(() => setStatus("analyzing"), 1500);
    const timer2 = setTimeout(() => setStatus("preparing"), 3000);
    const timer3 = setTimeout(() => onNext(), 4500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onNext]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-16 h-48 w-48 rounded-[3.5rem] border border-slate-50 flex items-center justify-center bg-[#F9FAFB] shadow-inner">
        <SyncIcon className="h-16 w-16 text-slate-900 animate-spin-slow" />
      </div>

      <div className="space-y-4 text-center mb-12">
        <h1 className="text-[40px] font-black tracking-tight text-slate-900 leading-[1.1]">
          Syncing Your Data
        </h1>
        <p className="text-[17px] font-bold text-slate-400/80 leading-relaxed max-w-[320px] mx-auto">
          We&apos;re pulling your content, audience, and performance metrics into your curated ledger.
        </p>
      </div>

      <div className="w-full space-y-4">
        <StatusItem label="Fetching content..." state={status === "fetching" ? "active" : "done"} />
        <StatusItem label="Analyzing engagement..." state={status === "fetching" ? "waiting" : status === "analyzing" ? "active" : "done"} />
        <StatusItem label="Preparing dashboard..." state={status === "preparing" ? "active" : "waiting"} />
      </div>

      <div className="mt-12 bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3">
        <LockIcon className="h-4 w-4 text-slate-400" />
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">AES-256 Encrypted Transfer</span>
      </div>
    </div>
  );
}

function StepFourContent({ connected }: { connected: string[] }) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-14 h-32 w-32 rounded-[2.5rem] bg-[#71717A] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center justify-center">
         {/* Blank gray rounded square from design */}
      </div>

      <div className="space-y-4 text-center mb-12">
        <h1 className="text-[36px] font-black tracking-tight text-slate-900 leading-[1.1]">
          You&apos;re All Set!
        </h1>
        <p className="text-[15px] font-bold text-slate-500 leading-relaxed">
          Your dashboard is ready with your<br/>latest data.
        </p>
      </div>

      <div className="w-full rounded-[2.5rem] border border-slate-100 p-8 space-y-6">
        <div className="flex justify-between items-center px-2">
           <span className="text-[11px] font-black text-slate-400/80 uppercase tracking-[0.2em]">Active Connections</span>
           <div className="bg-[#ECFDF5] px-3 py-1 rounded-lg flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[10px] font-black text-[#10B981] uppercase tracking-wider">Synced</span>
           </div>
        </div>
        <div className="space-y-4">
           {connected.map(p => (
             <div key={p} className="flex items-center gap-5 bg-[#F8FAFC] p-4 rounded-3xl">
                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                   {p === 'youtube' ? (
                     <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                   ) : (
                     <svg className="h-6 w-6 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                   )}
                </div>
                <div className="flex-1">
                   <p className="text-[14px] font-black text-slate-900 capitalize">{p} Creator</p>
                   <p className="text-[12px] font-bold text-slate-500">Syncing history...</p>
                </div>
                <CheckIcon className="h-4 w-4 text-[#10B981] mr-2" />
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, state }: { label: string; state: "waiting" | "active" | "done" }) {
  return (
    <div className={`flex items-center justify-between px-6 py-4 rounded-xl transition-all ${
      state === "done" || state === "active" ? "bg-[#F8FAFC]" : "bg-transparent"
    }`}>
      <div className="flex items-center gap-4">
        <div className="flex h-6 w-6 items-center justify-center">
          {state === "done" ? (
            <div className="h-5 w-5 rounded-full bg-slate-900 flex items-center justify-center">
              <CheckIcon className="h-3 w-3 text-white" />
            </div>
          ) : state === "active" ? (
            <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
          )}
        </div>
        <span className={`text-[14px] font-bold ${state === "waiting" ? "text-slate-400" : "text-slate-900"}`}>
          {label}
        </span>
      </div>
      <span className={`text-[11px] font-black uppercase tracking-wider ${
        state === "done" ? "text-slate-900" : state === "active" ? "text-slate-500" : "text-slate-300"
      }`}>
        {state === "done" ? "DONE" : state === "active" ? "ACTIVE" : "WAITING"}
      </span>
    </div>
  );
}

// Icons
function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ToggleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
      <circle cx="16" cy="12" r="3" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SyncIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
