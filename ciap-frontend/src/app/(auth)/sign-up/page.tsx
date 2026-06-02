import type { Metadata } from "next";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Authentication entry point for CIAP users.",
};

export default function SignInPage() {
  return <SignUpForm />;
}
