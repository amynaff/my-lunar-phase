"use client";

import { motion } from "framer-motion";
import type { PhaseInfo } from "@/lib/cycle/types";

interface PhaseInfoCardProps {
  phaseInfo: PhaseInfo;
  daysUntilNextPeriod?: number;
}

export function PhaseInfoCard({ phaseInfo, daysUntilNextPeriod }: PhaseInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full text-xl"
          style={{ backgroundColor: `${phaseInfo.color}20` }}
        >
          {phaseInfo.emoji}
        </div>
        <div>
          <h3 className="font-cormorant text-lg font-semibold text-text-primary">
            {phaseInfo.name} Phase
          </h3>
          <p className="text-xs text-text-accent font-quicksand font-medium">
            {phaseInfo.energy}
          </p>
        </div>
      </div>
      <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
        {phaseInfo.description}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-text-muted font-quicksand">
          Superpower: {phaseInfo.superpower}
        </span>
        {daysUntilNextPeriod !== undefined && daysUntilNextPeriod > 0 && (
          <span className="text-xs font-quicksand font-semibold text-accent-pink">
            {daysUntilNextPeriod}d until period
          </span>
        )}
      </div>
    </motion.div>
  );
}
