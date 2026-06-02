"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { apiService } from "@/services/api";

type AuthRole = "creator" | "sme";

type RoleOption = {
  value: AuthRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

const roleOptions: RoleOption[] = [
  {
    value: "creator",
    title: "I am a Creator",
    description: "Influencers, Artists, & Public Figures",
    icon: <UserCircleIcon />,
    color: "blue",
  },
  {
    value: "sme",
    title: "I am a Brand / SME",
    description: "Businesses & Marketing Agencies",
    icon: <WalletIcon />,
    color: "orange",
  },
];

export function SignUpForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AuthRole>("creator");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!fullName || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await apiService.register({
        full_name: fullName,
        email,
        password,
        role: selectedRole.toUpperCase(),
      });

      toast.success("Account created! Please sign in.");
      router.push("/sign-in");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[3.5rem] bg-white px-8 py-10 shadow-[0_24px_80px_rgba(51,65,85,0.08)] sm:px-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="text-base text-slate-500">
            Existing user?{" "}
            <Link href="/sign-in" className="font-bold text-slate-900 transition-colors hover:text-indigo-600">
              Login
            </Link>
          </p>
        </div>

        {/* Social Options */}
        <div className="space-y-4">
          <SocialButton label="Continue with Google" icon={<GoogleIcon />} />
          <SocialButton label="Continue with Apple" icon={<AppleIcon />} />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">or</span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        {/* Role Selection */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            Choose your role
          </p>
          <div className="space-y-3">
            {roleOptions.map((option) => (
              <RoleCard
                key={option.value}
                option={option}
                isSelected={selectedRole === option.value}
                onSelect={setSelectedRole}
              />
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <InputField
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<UserIcon />}
          />
          <InputField
            label="Email Address"
            placeholder="example@gmail.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<MailIcon />}
          />
          <InputField
            label="Choose Password"
            placeholder="minimum of 8 characters"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<ShieldIcon />}
            trailingIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            }
          />
        </div>

        {/* Primary Action */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSignUp()}
          className="flex h-16 w-full items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Sign Up"
          )}
        </button>

        {/* Footer */}
        <p className="px-4 text-center text-xs font-medium leading-relaxed text-slate-400">
          By continuing you agree to our{" "}
          <Link href="#" className="text-slate-600 underline underline-offset-2">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-slate-600 underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleCard({
  option,
  isSelected,
  onSelect,
}: {
  option: RoleOption;
  isSelected: boolean;
  onSelect: (role: AuthRole) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
        isSelected
          ? "border-indigo-600 bg-indigo-50/30"
          : "border-slate-100 bg-white hover:border-slate-200"
      }`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
        option.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
      }`}>
        {option.icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{option.title}</p>
        <p className="text-xs text-slate-500">{option.description}</p>
      </div>
    </button>
  );
}

function SocialButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-14 w-full items-center justify-center gap-4 rounded-full border border-slate-100 bg-white px-8 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.99]"
    >
      <span className="flex h-6 w-6 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
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
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-600">{label}</label>
      <div className="flex h-14 items-center gap-4 rounded-2xl border border-slate-100 bg-white px-5 transition-all focus-within:border-indigo-100 focus-within:bg-slate-50/30">
        <span className="text-slate-300">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-300"
        />
        {trailingIcon && <span className="text-slate-300">{trailingIcon}</span>}
      </div>
    </div>
  );
}

// Icons

function UserCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.5 2.5 12 2.5A9.5 9.5 0 1 0 12 21.5c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.6H12Z" />
      <path fill="#34A853" d="M3.7 7.5 6.9 9.8C7.8 7.1 9.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.5 2.5 12 2.5c-3.6 0-6.7 2-8.3 5Z" />
      <path fill="#FBBC05" d="M12 21.5c2.4 0 4.5-.8 6.1-2.3l-2.8-2.3c-.8.6-1.9 1-3.3 1-3.9 0-5.2-2.5-5.5-3.8l-3.2 2.5c1.6 3.1 4.8 4.9 8.7 4.9Z" />
      <path fill="#4285F4" d="M21.1 12.3c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.3 1.2-1 2.1-2 2.8l2.8 2.3c1.7-1.6 2.8-4 2.8-7.4Z" />
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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
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
