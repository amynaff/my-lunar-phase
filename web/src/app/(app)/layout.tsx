"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GradientBackground } from "@/components/shared/gradient-background";
import { useCycleSync } from "@/hooks/use-cycle-sync";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Sync cycle data between localStorage and database
  useCycleSync();

  useEffect(() => {
    // Check localStorage first, then fall back to server check
    try {
      const raw = localStorage.getItem("luna-cycle-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        const state = parsed?.state;
        if (state?.hasCompletedOnboarding || state?.lifeStage !== "regular" || state?.lastPeriodStart) {
          setReady(true);
          return;
        }
      }

      // No local data — check server (new device for existing user)
      fetch("/api/cycle-data")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.cycleData?.hasCompletedOnboarding) {
            // Server has data — user already onboarded on another device
            setReady(true);
          } else {
            router.replace("/onboarding");
          }
        })
        .catch(() => router.replace("/onboarding"));
    } catch {
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
