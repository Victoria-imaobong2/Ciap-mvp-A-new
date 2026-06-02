"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/verify-email"];

  useEffect(() => {
    if (!loading) {
      const hasToken = localStorage.getItem("authToken");
      if (!hasToken && !publicPaths.includes(pathname)) {
        router.push("/sign-in");
      } else if (hasToken && user) {
        if (user.role === "CREATOR") {
          if (!user.isOnboarded && pathname !== "/onboarding" && !pathname.startsWith("/oauth/callback")) {
            router.push("/onboarding");
          } else if (user.isOnboarded && pathname === "/onboarding") {
            router.push("/");
          }
        } else if (user.role === "SME") {
          if (pathname === "/onboarding") {
            router.push("/?role=sme");
          }
        }
      }
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-12 h-12 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
