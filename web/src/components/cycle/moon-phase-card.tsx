"use client";

import { motion } from "framer-motion";
import type { MoonPhaseInfo } from "@/lib/cycle/types";

interface MoonPhaseCardProps {
  moonPhaseInfo: MoonPhaseInfo;
  compact?: boolean;
}

export function MoonPhaseCard({ moonPhaseInfo, compact = false }: MoonPhaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[20px] border border-border-light bg-bg-card p-5"
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${moonPhaseInfo.color}, transparent 70%)`,
        }}
      />
      <div className="relative flex items-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-bg-secondary text-4xl">
          {moonPhaseInfo.emoji}
        </div>
        <div className="flex-1">
          <h3 className="font-cormorant text-xl font-semibold text-text-primary">
            {moonPhaseInfo.name}
          </h3>
          <p className="text-sm text-text-accent font-quicksand font-medium">
            {moonPhaseInfo.energy}
          </p>
        </div>
      </div>
      {!compact && (
        <p className="relative mt-3 text-sm text-text-secondary font-quicksand leading-relaxed">
          {moonPhaseInfo.description}
        </p>
      )}
    </motion.div>
  );
}
