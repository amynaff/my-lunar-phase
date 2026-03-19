"use client";

import { motion } from "framer-motion";
import { MoonCalendar } from "@/components/calendar/moon-calendar";
import { useCycleData } from "@/hooks/use-cycle-data";
import { useCycleStore } from "@/stores/cycle-store";
import { getMoonPhase } from "@/lib/cycle/moon-phase";
import { moonPhaseInfo } from "@/lib/cycle/data";

export default function CalendarPage() {
  const { isRegular, currentMoonInfo } = useCycleData();
  const { lastPeriodStart, cycleLength, periodLength, setLastPeriodStart } = useCycleStore();
  const todayMoon = getMoonPhase();
  const todayMoonInfo = moonPhaseInfo[todayMoon];

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
          Today: {todayMoonInfo.emoji} {todayMoonInfo.name}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <MoonCalendar
          isRegular={isRegular}
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
      </motion.div>
    </div>
  );
}
