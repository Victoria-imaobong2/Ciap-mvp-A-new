"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiService } from "@/services/api";

import { useAuth } from "@/context/AuthContext";

export function SignInForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.login({ email, password });
      
      toast.success("Welcome back!");
      
      // Use global login handler which manages state and redirection
      await login(result);
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[3.5rem] bg-white px-8 py-12 shadow-[0_24px_80px_rgba(51,65,85,0.08)] sm:px-12">
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h1>
          <p className="text-base text-slate-500">
            New user?{" "}
            <Link href="/sign-up" className="font-bold text-slate-900 transition-colors hover:text-indigo-600">
              Create account
            </Link>
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-8">
          <InputField
            label="Email Address"
            placeholder="example@gmail.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<MailIcon />}
          />
          <InputField
            label="Password"
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<ShieldIcon />}
            trailingIcon={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="transition-colors hover:text-indigo-600"
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            }
          />
        </div>

        {/* Forgot Password */}
        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm font-bold text-slate-500 underline underline-offset-4 transition-colors hover:text-slate-900"
          >
            Forgot Password
          </Link>
        </div>

        {/* Primary Action */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSignIn()}
          className="flex h-16 w-full items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Sign In"
          )}
        </button>

        {/* Social Options */}
        <div className="space-y-4">
          <SocialButton 
            label="Continue with Google" 
            icon={<GoogleIcon />} 
          />
          <SocialButton 
            label="Continue with Apple" 
            icon={<AppleIcon />} 
          />
        </div>

        {/* Footer */}
        <p className="px-4 text-center text-xs font-medium leading-relaxed text-slate-400">
          By continuing you agree to our{" "}
          <Link href="#" className="text-slate-600 underline underline-offset-2 hover:text-slate-900">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-slate-600 underline underline-offset-2 hover:text-slate-900">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  icon,
  trailingIcon,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  trailingIcon?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-slate-600">{label}</label>
      <div className="group relative flex h-16 items-center gap-4 rounded-3xl border border-slate-100 bg-slate-50/50 px-6 transition-all focus-within:border-indigo-100 focus-within:bg-white focus-within:shadow-sm">
        <span className="text-slate-400 transition-colors group-focus-within:text-indigo-500">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-300"
        />
        {trailingIcon && (
          <span className="text-slate-300 transition-colors">
            {trailingIcon}
          </span>
        )}
      </div>
    </div>
  );
}

function SocialButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-16 w-full items-center justify-center gap-4 rounded-full border border-slate-100 bg-white px-8 text-base font-bold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm active:scale-[0.99]"
    >
      <span className="flex h-6 w-6 items-center justify-center">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

// Icons (re-used and slightly improved from SignUpForm)

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.5 2.5 12 2.5A9.5 9.5 0 1 0 12 21.5c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.6H12Z"
      />
      <path
        fill="#34A853"
        d="M3.7 7.5 6.9 9.8C7.8 7.1 9.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.5 2.5 12 2.5c-3.6 0-6.7 2-8.3 5Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.5c2.4 0 4.5-.8 6.1-2.3l-2.8-2.3c-.8.6-1.9 1-3.3 1-3.9 0-5.2-2.5-5.5-3.8l-3.2 2.5c1.6 3.1 4.8 4.9 8.7 4.9Z"
      />
      <path
        fill="#4285F4"
        d="M21.1 12.3c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.3 1.2-1 2.1-2 2.8l2.8 2.3c1.7-1.6 2.8-4 2.8-7.4Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-slate-900">
      <path d="M16.7 12.7c0-2.2 1.8-3.3 1.9-3.3-1-1.5-2.7-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.6 0-3 .9-3.8 2.2-1.6 2.7-.4 6.8 1.2 9.1.8 1.1 1.7 2.3 3 2.3 1.2 0 1.7-.8 3.2-.8s2 .8 3.2.8c1.3 0 2.2-1.1 3-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-3.4-1.3-3.4-5.8Zm-2.2-6.3c.6-.8 1-1.9.9-3.1-.9 0-2.1.6-2.7 1.3-.6.7-1.1 1.9-.9 3 .9.1 2-.5 2.7-1.2Z" />
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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
