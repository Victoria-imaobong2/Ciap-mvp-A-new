import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new password for your account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
