"use client";

import { GradientBackground } from "@/components/shared/gradient-background";
import { Moon } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GradientBackground>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Moon className="h-8 w-8 text-accent-purple" />
          <span className="font-cormorant text-3xl font-semibold text-text-primary">MyLunarPhase</span>
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </GradientBackground>
  );
}
