"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { toast } from "sonner";

import { apiService } from "@/services/api";

export function VerifyEmailForm({ email = "example@gmail.com" }: { email?: string }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!isComplete) return;
    
    setLoading(true);
    try {
      await apiService.verifyEmail({ 
        email, 
        otp: otp.join("") 
      });

      toast.success("Email verified successfully!");
      const role = localStorage.getItem("userRole") || "creator";
      if (role === "creator") {
        window.location.href = "/onboarding";
      } else {
        window.location.href = `/?role=${role}`;
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[3.5rem] bg-white px-8 py-10 shadow-[0_24px_80px_rgba(51,65,85,0.08)] sm:px-12">
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Sign up to get started!
          </h1>
          <p className="text-base text-slate-500">
            Existing user?{" "}
            <Link href="/sign-in" className="font-bold text-slate-900 transition-colors hover:text-indigo-600">
              Login
            </Link>
          </p>
        </div>

        {/* Email Icon */}
        <div className="flex justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <MailOpenIcon />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-slate-900">We just emailed you.</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Please enter the code we sent to your email <span className="font-bold text-slate-700">{email}</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="mx-auto w-fit space-y-4">
          <div className="flex gap-3 sm:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`h-16 w-16 rounded-2xl border-2 text-center text-2xl font-bold outline-none transition-all sm:h-20 sm:w-20 ${
                  digit ? "border-[#2e2a39] bg-white text-[#2e2a39]" : 
                  "border-[#eceaf1] bg-[#fcfbfd] text-[#2e2a39] focus:border-[#4f46e5] focus:bg-white"
                }`}
              />
            ))}
          </div>
          
          {error && (
            <div className="flex items-center gap-2 px-1 text-sm font-medium text-[#8a8695]">
              <WarningIcon className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Primary Action */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={!isComplete || loading}
          className={`flex h-16 w-full items-center justify-center rounded-full text-lg font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
            isComplete && !loading ? "bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700" : "bg-indigo-400 opacity-70 cursor-not-allowed shadow-none"
          }`}
        >
          {loading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Verify Email"
          )}
        </button>

        {/* Resend Link */}
        <div className="text-center">
          <button
            type="button"
            className="text-sm font-bold text-slate-500 underline underline-offset-4 transition-colors hover:text-slate-900"
          >
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
}

function MailOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
      <path d="M21.2 8.5l-9 6.1-9-6.1" />
      <path d="M2.2 19.3l7.3-6.2m12.3 6.2l-7.3-6.2" />
      <path d="M2 10V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
      <path d="M2 15v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L1 21h22L12 2zm0 3.45L19.53 19H4.47L12 5.45zM11 16h2v2h-2v-2zm0-7h2v5h-2V9z" />
    </svg>
  );
}
