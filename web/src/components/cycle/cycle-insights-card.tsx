"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle, Activity, Sparkles, Bell } from "lucide-react";
import { useCycleStore } from "@/stores/cycle-store";
import { useCycleData } from "@/hooks/use-cycle-data";
import Link from "next/link";

export function CycleInsightsCard() {
  const { isRegular, dayOfCycle, daysUntilNextPeriod, currentPhaseInfo } = useCycleData();
  const { lastPeriodStart, cycleLength, periodLength } = useCycleStore();

  if (!isRegular || !lastPeriodStart) return null;

  const isCycleLengthNormal = cycleLength >= 21 && cycleLength <= 35;
  const isPeriodLengthNormal = periodLength >= 2 && periodLength <= 7;

  // Ovulation and fertile window
  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 5;
  const daysUntilOvulation = ovulationDay - dayOfCycle;
  const isInFertileWindow = dayOfCycle >= fertileStart && dayOfCycle <= ovulationDay + 1;
  const isOvulationDay = dayOfCycle === ovulationDay;

  // Period alert: arriving in 1–3 days
  const isPeriodSoon = daysUntilNextPeriod >= 1 && daysUntilNextPeriod <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-accent-purple" />
        <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
          Cycle Insights
        </h3>
      </div>

      {/* Period soon alert */}
      {isPeriodSoon && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-accent-pink/10 border border-accent-pink/20 px-3 py-2.5">
          <Bell className="h-4 w-4 text-accent-pink flex-shrink-0" />
          <p className="text-xs font-quicksand text-accent-pink font-semibold">
            {daysUntilNextPeriod === 1
              ? "Your period is expected tomorrow — be prepared!"
              : `Your period is expected in ${daysUntilNextPeriod} days.`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-bg-secondary/50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="h-3.5 w-3.5 text-accent-pink" />
            <span className="text-[10px] text-text-muted font-quicksand uppercase">Cycle Day</span>
          </div>
          <p className="text-lg font-cormorant font-semibold text-text-primary">
            {dayOfCycle} <span className="text-xs text-text-muted font-quicksand">of {cycleLength}</span>
          </p>
        </div>
        <div className="rounded-xl bg-bg-secondary/50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-accent-purple" />
            <span className="text-[10px] text-text-muted font-quicksand uppercase">Next Period</span>
          </div>
          <p className="text-lg font-cormorant font-semibold text-text-primary">
            {daysUntilNextPeriod <= 0
              ? <span className="text-accent-pink text-sm">Today</span>
              : <>{daysUntilNextPeriod} <span className="text-xs text-text-muted font-quicksand">days</span></>
            }
          </p>
        </div>
      </div>

      {/* Fertile / ovulation window */}
      <div
        className="rounded-xl p-3 mb-4 flex items-center gap-3"
        style={{
          backgroundColor: isInFertileWindow ? "#ec489910" : "#9d84ed10",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: isInFertileWindow ? "#ec489930" : "#9d84ed20",
        }}
      >
        <Sparkles className="h-4 w-4 flex-shrink-0" style={{ color: isInFertileWindow ? "#ec4899" : "#9d84ed" }} />
        <div>
          {isOvulationDay ? (
            <>
              <p className="text-xs font-quicksand font-bold" style={{ color: "#ec4899" }}>
                Ovulation Day 🌟
              </p>
              <p className="text-[10px] text-text-muted font-quicksand">Peak fertility — highest chance of conception today</p>
            </>
          ) : isInFertileWindow ? (
            <>
              <p className="text-xs font-quicksand font-bold text-accent-pink">
                Fertile Window
              </p>
              <p className="text-[10px] text-text-muted font-quicksand">
                Ovulation in {daysUntilOvulation} day{daysUntilOvulation !== 1 ? "s" : ""}
              </p>
            </>
          ) : daysUntilOvulation > 0 ? (
            <>
              <p className="text-xs font-quicksand font-semibold text-text-primary">Ovulation predicted</p>
              <p className="text-[10px] text-text-muted font-quicksand">
                In ~{daysUntilOvulation} day{daysUntilOvulation !== 1 ? "s" : ""} · fertile window opens in ~{Math.max(0, fertileStart - dayOfCycle)} days
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-quicksand font-semibold text-text-primary">Post-ovulation phase</p>
              <p className="text-[10px] text-text-muted font-quicksand">Luteal phase — preparing for next cycle</p>
            </>
          )}
        </div>
      </div>

      {/* Status indicators */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          {isCycleLengthNormal ? (
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className="text-xs font-quicksand text-text-secondary">
            Cycle length: {cycleLength} days {isCycleLengthNormal ? "(normal)" : "(outside typical range)"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isPeriodLengthNormal ? (
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className="text-xs font-quicksand text-text-secondary">
            Period length: {periodLength} days {isPeriodLengthNormal ? "(normal)" : "(outside typical range)"}
          </span>
        </div>
      </div>

      {/* Current phase */}
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{ backgroundColor: `${currentPhaseInfo.color}10` }}
      >
        <span className="text-xl">{currentPhaseInfo.emoji}</span>
        <div>
          <p className="text-sm font-quicksand font-semibold text-text-primary">{currentPhaseInfo.name}</p>
          <p className="text-[10px] text-text-muted font-quicksand">{currentPhaseInfo.energy}</p>
        </div>
      </div>

      <Link
        href="/cycle-history"
        className="flex items-center justify-center gap-1.5 mt-4 py-2 rounded-xl bg-bg-secondary/50 hover:bg-bg-secondary text-xs font-quicksand font-semibold text-text-secondary transition-colors"
      >
        <TrendingUp className="h-3.5 w-3.5" />
        View Cycle History
      </Link>
    </motion.div>
  );
}
