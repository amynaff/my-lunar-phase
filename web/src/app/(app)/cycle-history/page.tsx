"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, Clock, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useCycleStore } from "@/stores/cycle-store";
import { useCycleData } from "@/hooks/use-cycle-data";
import { MoonCalendar } from "@/components/calendar/moon-calendar";
import { LogPeriodModal } from "@/components/cycle/log-period-modal";

export default function CycleHistoryPage() {
  const { isRegular, dayOfCycle, daysUntilNextPeriod, currentPhaseInfo } = useCycleData();
  const { lastPeriodStart, cycleLength, periodLength, setLastPeriodStart } = useCycleStore();
  const [showLogModal, setShowLogModal] = useState(false);

  const lastStart = lastPeriodStart ? new Date(lastPeriodStart) : null;
  const isCycleLengthNormal = cycleLength >= 21 && cycleLength <= 35;
  const isPeriodLengthNormal = periodLength >= 2 && periodLength <= 7;

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/settings" className="p-2 rounded-full hover:bg-bg-secondary">
            <ChevronLeft className="h-5 w-5 text-text-secondary" />
          </Link>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">Cycle History</h1>
            <p className="text-sm text-text-secondary font-quicksand">Track and understand your patterns</p>
          </div>
        </div>
      </motion.div>

      {/* Stats overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-border-light bg-bg-card p-4 text-center">
          <Calendar className="h-4 w-4 text-accent-pink mx-auto mb-1" />
          <p className="text-xl font-cormorant font-semibold text-text-primary">{cycleLength}</p>
          <p className="text-[10px] text-text-muted font-quicksand uppercase tracking-wider">Cycle Length</p>
        </div>
        <div className="rounded-2xl border border-border-light bg-bg-card p-4 text-center">
          <Clock className="h-4 w-4 text-accent-purple mx-auto mb-1" />
          <p className="text-xl font-cormorant font-semibold text-text-primary">{periodLength}</p>
          <p className="text-[10px] text-text-muted font-quicksand uppercase tracking-wider">Period Length</p>
        </div>
        <div className="rounded-2xl border border-border-light bg-bg-card p-4 text-center">
          <TrendingUp className="h-4 w-4 text-green-500 mx-auto mb-1" />
          <p className="text-xl font-cormorant font-semibold text-text-primary">{dayOfCycle}</p>
          <p className="text-[10px] text-text-muted font-quicksand uppercase tracking-wider">Current Day</p>
        </div>
      </motion.div>

      {/* Health indicators */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[20px] border border-border-light bg-bg-card p-5 mb-6">
        <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-4">Cycle Health</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCycleLengthNormal ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
              <span className="text-sm font-quicksand text-text-primary">Cycle Length</span>
            </div>
            <span className="text-sm font-quicksand text-text-secondary">{cycleLength} days</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPeriodLengthNormal ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
              <span className="text-sm font-quicksand text-text-primary">Period Length</span>
            </div>
            <span className="text-sm font-quicksand text-text-secondary">{periodLength} days</span>
          </div>
          {lastStart && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-quicksand text-text-primary">Last Period</span>
              <span className="text-sm font-quicksand text-text-secondary">
                {lastStart.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          )}
          {isRegular && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-quicksand text-text-primary">Next Period</span>
              <span className="text-sm font-quicksand text-accent-pink font-semibold">
                in {daysUntilNextPeriod} days
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Current phase card */}
      {isRegular && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-[20px] border border-border-light bg-bg-card p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${currentPhaseInfo.color}15` }}>
              {currentPhaseInfo.emoji}
            </div>
            <div>
              <h3 className="font-cormorant text-lg font-semibold text-text-primary">{currentPhaseInfo.name}</h3>
              <p className="text-xs text-text-accent font-quicksand">{currentPhaseInfo.energy}</p>
            </div>
          </div>
          <p className="text-sm text-text-secondary font-quicksand mt-3 leading-relaxed">{currentPhaseInfo.description}</p>
        </motion.div>
      )}

      {/* Calendar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <MoonCalendar
          isRegular={isRegular}
          lastPeriodStart={lastPeriodStart}
          cycleLength={cycleLength}
          periodLength={periodLength}
          onSetPeriodStart={setLastPeriodStart}
        />
      </motion.div>

      {/* Log period button */}
      {isRegular && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6">
          <button
            onClick={() => setShowLogModal(true)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold transition-opacity hover:opacity-90"
          >
            Log Period Start
          </button>
        </motion.div>
      )}

      <LogPeriodModal open={showLogModal} onClose={() => setShowLogModal(false)} />
    </div>
  );
}
