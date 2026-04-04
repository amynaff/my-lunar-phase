"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GradientBackground } from "@/components/shared/gradient-background";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Read directly from localStorage to avoid Zustand hydration race
    try {
      const raw = localStorage.getItem("luna-cycle-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        const state = parsed?.state;
        // If they have a life stage set OR completed onboarding, let them through
        if (state?.hasCompletedOnboarding || state?.lifeStage !== "regular" || state?.lastPeriodStart) {
          setReady(true);
          return;
        }
      }
      // No stored data = brand new user → onboarding
      router.replace("/onboarding");
    } catch {
      // If localStorage fails, just let them through
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <GradientBackground>
        <div className="min-h-screen" />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          <MobileNav />
        </div>
      </div>
    </GradientBackground>
  );
}
