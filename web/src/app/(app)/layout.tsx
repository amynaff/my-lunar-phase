"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GradientBackground } from "@/components/shared/gradient-background";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
