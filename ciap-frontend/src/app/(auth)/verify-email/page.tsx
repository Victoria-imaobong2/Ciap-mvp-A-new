import type { Metadata } from "next";
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to complete registration.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
