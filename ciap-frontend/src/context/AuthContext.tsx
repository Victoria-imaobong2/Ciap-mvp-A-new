"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  email: string;
  role: "CREATOR" | "SME" | "ADMIN";
  isOnboarded: boolean;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  logout: () => void;
  updateOnboardingStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (result: any) => {
    const userData: User = {
      id: result.data.user_id,
      email: result.data.email,
      role: result.data.role,
      isOnboarded: result.data.is_onboarded,
      fullName: result.data.full_name,
    };

    localStorage.setItem("authToken", result.data.access_token);
    localStorage.setItem("authUser", JSON.stringify(userData));
    setUser(userData);

    if (result.data.is_onboarded) {
      router.push("/");
    } else {
      const rolePath = result.data.role === "CREATOR" ? "/onboarding" : "/";
      router.push(rolePath);
    }
  };

  const signUp = async (result: any) => {
    const userData: User = {
      id: result.data.user_id,
      email: result.data.email,
      role: result.data.role,
      isOnboarded: result.data.is_onboarded || false,
      fullName: result.data.full_name,
    };

    localStorage.setItem("authToken", result.data.access_token);
    localStorage.setItem("authUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
    router.push("/sign-in");
  };

  const updateOnboardingStatus = (status: boolean) => {
    if (user) {
      const updatedUser = { ...user, isOnboarded: status };
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout, updateOnboardingStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
