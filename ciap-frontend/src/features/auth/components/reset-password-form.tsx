"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { apiService } from "@/services/api";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }
    if (strength < 4) {
      toast.error("Password does not meet all requirements");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiService.resetPassword({
        token,
        new_password: password
      });
      
      toast.success("Password reset successful!");
      router.push("/sign-in");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const requirements = useMemo(() => [
    { label: "8+ CHARACTERS", met: password.length >= 8 },
    { label: "SYMBOL", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: "NUMBER", met: /\d/.test(password) },
    { label: "UPPERCASE", met: /[A-Z]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    return requirements.filter(r => r.met).length;
  }, [requirements]);

  return (
    <div className="w-full rounded-[3.5rem] bg-white px-8 py-10 shadow-[0_24px_80px_rgba(51,65,85,0.08)] sm:px-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <ResetIcon className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Reset your password
          </h1>
          <p className="text-base text-slate-500 leading-relaxed">
            Create a new password for your account.
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          {/* New Password */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">New Password</label>
              <div className="flex h-16 items-center gap-4 rounded-3xl border border-slate-100 bg-[#fcfbfd] px-6 transition-all focus-within:border-indigo-100 focus-within:bg-white">
                <span className="text-slate-300">
                  <ShieldIcon />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="minimum of 8 characters"
                  className="w-full bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-300"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400">
                  {showPassword ? <EyeIcon className="h-6 w-6" /> : <EyeOffIcon className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Strength Bar */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-colors ${
                    strength >= step ? "bg-indigo-500" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {requirements.map((req) => (
                <div key={req.label} className="flex items-center gap-2">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    req.met ? "bg-indigo-500 text-white" : "border-2 border-slate-100"
                  }`}>
                    {req.met && <CheckIcon className="h-2.5 w-2.5" />}
                  </div>
                  <span className={`text-[10px] font-black tracking-wider ${
                    req.met ? "text-indigo-500" : "text-slate-300"
                  }`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">Confirm Password</label>
            <div className="flex h-16 items-center gap-4 rounded-3xl border border-slate-100 bg-[#fcfbfd] px-6 transition-all focus-within:border-indigo-100 focus-within:bg-white">
              <span className="text-slate-300">
                <ShieldIcon />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="minimum of 8 characters"
                className="w-full bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-300"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-slate-400">
                {showConfirmPassword ? <EyeIcon className="h-6 w-6" /> : <EyeOffIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Security Info Box */}
        <div className="rounded-[2rem] bg-slate-50/80 p-6">
          <div className="flex gap-4">
            <div className="shrink-0 pt-0.5">
              <ShieldCheckIcon className="h-6 w-6 text-indigo-500" />
            </div>
            <p className="text-[13px] leading-relaxed text-slate-500">
              Your security is our priority. We use industry-standard encryption to protect your account recovery process.
            </p>
          </div>
        </div>

        {/* Primary Action */}
        <button
          type="button"
          disabled={strength < 4 || password !== confirmPassword || loading}
          onClick={() => handleResetPassword()}
          className="flex h-16 w-full items-center justify-center rounded-full bg-indigo-500 text-lg font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Reset Password"
          )}
        </button>
      </div>
    </div>
  );
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <rect x="10" y="10" width="4" height="4" rx="1" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
