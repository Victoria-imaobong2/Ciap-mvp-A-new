"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { apiService } from "@/services/api";
import { toast } from "sonner";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    
    const code = searchParams.get("code");
    const platform = params.platform as string;

    if (code && platform) {
      hasCalled.current = true;
      handleCallback(platform, code);
    } else if (!success && !loading) {
      toast.error("Invalid callback data");
      router.push("/onboarding");
    }
  }, [searchParams, params, success, loading]);

  const handleCallback = async (platform: string, code: string) => {
    try {
      await apiService.handleOAuthCallback(platform, code);
      setSuccess(true);
      toast.success(`Successfully connected to ${platform}!`);
      
      // Wait for 2 seconds so the user can see the success state
      setTimeout(() => {
        router.push("/onboarding");
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to connect platform");
      router.push("/onboarding");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfbfd]">
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto shadow-lg shadow-green-100/50">
            <CheckIcon className="h-12 w-12 text-green-600 animate-in zoom-in spin-in-90 duration-700" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Connected!</h1>
            <p className="text-lg font-bold text-slate-400">Successfully linked your account.</p>
          </div>
          <div className="pt-4">
             <div className="h-1.5 w-48 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-green-500 animate-[progress_2s_linear]" />
             </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcfbfd]">
      <div className="text-center space-y-6">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">Connecting your account...</h1>
        <p className="text-slate-500">Please wait while we finalize the connection.</p>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
