"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { apiService } from "@/services/api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.forgotPassword(email);
      toast.success(result.message || "Reset link sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[3.5rem] bg-white px-8 py-10 shadow-[0_24px_80px_rgba(51,65,85,0.08)] sm:px-12">
      <div className="space-y-10">
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
          <p className="text-base text-slate-500 leading-relaxed max-w-[280px] mx-auto">
            Enter your email and we&apos;ll send you a link to get back into your account.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600">Email Address</label>
          <div className="flex h-16 items-center gap-4 rounded-3xl border border-slate-100 bg-[#fcfbfd] px-6 transition-all focus-within:border-indigo-100 focus-within:bg-white">
            <span className="text-slate-300">
              <MailIcon />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-300"
            />
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
          disabled={loading}
          onClick={() => handleResetLink()}
          className="group flex h-16 w-full items-center justify-center gap-3 rounded-full bg-indigo-500 text-lg font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Send Reset Link
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/sign-in"
            className="text-sm font-bold text-slate-500 underline underline-offset-4 transition-colors hover:text-slate-900"
          >
            Back to Sign In
          </Link>
        </div>
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

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
