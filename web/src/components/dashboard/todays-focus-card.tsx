"use client";

import { motion } from "framer-motion";
import { Apple, Dumbbell, Heart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCycleData } from "@/hooks/use-cycle-data";
import { phaseTips } from "@/lib/cycle/data";

const tipConfig = [
  {
    key: "nutrition" as const,
    label: "Nutrition",
    icon: Apple,
    href: "/nutrition",
    color: "#ec4899",
    bg: "#ec489910",
  },
  {
    key: "movement" as const,
    label: "Movement",
    icon: Dumbbell,
    href: "/movement",
    color: "#9333ea",
    bg: "#9333ea10",
  },
  {
    key: "selfcare" as const,
    label: "Self-Care",
    icon: Heart,
    href: "/selfcare",
    color: "#9d84ed",
    bg: "#9d84ed10",
  },
];

export function TodaysFocusCard() {
  const { currentPhase, isRegular, dayOfCycle } = useCycleData();

  if (!isRegular) return null;

  // Rotate tip type by day of cycle so it changes daily
  const tipIndex = (dayOfCycle - 1) % tipConfig.length;
  const tip = tipConfig[tipIndex];
  const tips = phaseTips[currentPhase];
  const tipText = tips[tip.key];
  const Icon = tip.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <p className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-3">
        Today&apos;s Focus
      </p>
      <Link
        href={tip.href}
        className="flex items-start gap-4 p-4 rounded-[20px] border border-border-light bg-bg-card hover:bg-bg-secondary/50 transition-colors group"
        style={{ borderLeftWidth: 3, borderLeftColor: tip.color }}
      >
        <div
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full mt-0.5"
          style={{ backgroundColor: tip.bg }}
        >
          <Icon className="h-5 w-5" style={{ color: tip.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-quicksand font-semibold uppercase tracking-wider mb-1" style={{ color: tip.color }}>
            {tip.label}
          </p>
          <p className="text-sm font-quicksand text-text-secondary leading-relaxed">
            {tipText}
          </p>
        </div>
        <ChevronRight
          className="h-4 w-4 text-text-muted flex-shrink-0 mt-3 group-hover:text-text-primary transition-colors"
        />
      </Link>
    </motion.div>
  );
}
