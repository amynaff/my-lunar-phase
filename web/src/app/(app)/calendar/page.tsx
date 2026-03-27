"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { MoonCalendar } from "@/components/calendar/moon-calendar";
import { useCycleData } from "@/hooks/use-cycle-data";
import { useCycleStore } from "@/stores/cycle-store";
import { getMoonPhase } from "@/lib/cycle/moon-phase";
import { moonPhaseInfo } from "@/lib/cycle/data";

export default function CalendarPage() {
  const { isRegular, currentMoonInfo, lifeStage } = useCycleData();
  const { lastPeriodStart, cycleLength, periodLength, setLastPeriodStart } = useCycleStore();
  const todayMoon = getMoonPhase();
  const todayMoonInfo = moonPhaseInfo[todayMoon];
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  function handleResetToday() {
    setLastPeriodStart(new Date());
    setShowResetConfirm(true);
    setTimeout(() => setShowResetConfirm(false), 2500);
  }

  return (
    <div className="max-w-lg mx-auto px-4 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
          {isRegular ? "Cycle & Moon Calendar" : "Moon Calendar"}
        </h1>
        <p className="text-sm text-text-secondary font-quicksand mt-1">
          {isRegular
            ? `Today: ${todayMoonInfo.emoji} ${todayMoonInfo.name}`
            : `Connect with the lunar rhythm — ${todayMoonInfo.emoji} ${todayMoonInfo.name}`}
        </p>
      </motion.div>

      {/* Quick period reset for regular cycle users */}
      {isRegular && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4 rounded-2xl border border-accent-pink/20 bg-accent-pink/5 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-quicksand font-semibold text-text-primary">
                Period started today?
              </p>
              <p className="text-xs text-text-muted font-quicksand mt-0.5">
                Reset your Day 1 — perfect for irregular cycles
              </p>
            </div>
            <button
              onClick={handleResetToday}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-pink/15 hover:bg-accent-pink/25 transition-colors text-accent-pink text-sm font-quicksand font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {showResetConfirm ? "Updated!" : "Reset Day 1"}
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <MoonCalendar
          isRegular={isRegular}
          lifeStage={lifeStage}
          lastPeriodStart={lastPeriodStart}
          cycleLength={cycleLength}
          periodLength={periodLength}
          onSetPeriodStart={setLastPeriodStart}
        />
      </motion.div>

      {/* Today's moon info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 rounded-[20px] border border-border-light bg-bg-card p-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{todayMoonInfo.emoji}</span>
          <div>
            <h3 className="font-cormorant text-lg font-semibold text-text-primary">
              {todayMoonInfo.name}
            </h3>
            <p className="text-xs text-text-accent font-quicksand">{todayMoonInfo.energy}</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
          {todayMoonInfo.description}
        </p>
        {!isRegular && (
          <p className="text-xs text-text-muted font-quicksand mt-3 italic">
            Let the moon guide your rhythms — rest during the new moon, celebrate during the full moon.
          </p>
        )}
      </motion.div>
    </div>
  );
}
