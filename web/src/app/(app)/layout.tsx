"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GradientBackground } from "@/components/shared/gradient-background";
import { useCycleStore } from "@/stores/cycle-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasCompletedOnboarding = useCycleStore((s) => s.hasCompletedOnboarding);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for hydration from localStorage before checking
    if (!hasCompletedOnboarding) {
      router.replace("/onboarding");
    } else {
      setChecked(true);
    }
  }, [hasCompletedOnboarding, router]);

  if (!checked) {
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
