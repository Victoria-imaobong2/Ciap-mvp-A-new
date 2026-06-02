import type { Metadata } from "next";
import { CreatorOnboarding } from "@/features/auth/components/creator-onboarding";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Set up your creator profile and connect your platforms.",
};

export default function OnboardingPage() {
  return <CreatorOnboarding />;
}
