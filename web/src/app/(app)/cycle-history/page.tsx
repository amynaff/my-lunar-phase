"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, Clock, TrendingUp, CheckCircle, AlertTriangle, Activity } from "lucide-react";
import Link from "next/link";
import { useCycleStore } from "@/stores/cycle-store";
import { useCycleData } from "@/hooks/use-cycle-data";
import { MoonCalendar } from "@/components/calendar/moon-calendar";
import { LogPeriodModal } from "@/components/cycle/log-period-modal";
import { PastPeriodsList } from "@/components/cycle/past-periods-list";

// ── Compute historical cycle lengths from period logs ──
function computeCycleLengths(periodLogs: { startDate: string; endDate: string | null }[]): number[] {
  const completed = [...periodLogs]
    .filter((l) => l.startDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const lengths: number[] = [];
  for (let i = 1; i < completed.length; i++) {
    const prev = new Date(completed[i - 1].startDate + "T12:00:00");
    const curr = new Date(completed[i].startDate + "T12:00:00");
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0 && diff < 90) lengths.push(diff);
  }
  return lengths;
}

// ── Regularity score ──
function getRegularityScore(lengths: number[]): { label: string; description: string; color: string; score: number } {
  if (lengths.length < 2) {
    return { label: "Not enough data", description: "Log at least 3 periods to see your regularity score.", color: "#9ca3af", score: 0 };
  }
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
  const sd = Math.sqrt(variance);
  const score = Math.max(0, Math.min(100, Math.round(100 - sd * 10)));
  if (sd < 2) return { label: "Very Regular", description: "Your cycle is highly consistent. Great for prediction!", color: "#22c55e", score };
  if (sd < 4) return { label: "Mostly Regular", description: "Minor variations are completely normal.", color: "#f59e0b", score };
  return { label: "Variable", description: "Cycles vary quite a bit — stress, illness, or hormonal shifts can cause this.", color: "#ec4899", score };
}

export default function CycleHistoryPage() {
  const { isRegular, dayOfCycle, daysUntilNextPeriod, currentPhaseInfo } = useCycleData();
  const { lastPeriodStart, cycleLength, periodLength, setLastPeriodStart, periodLogs } = useCycleStore();

  const cycleLengths = useMemo(() => computeCycleLengths(periodLogs), [periodLogs]);
  const regularity = useMemo(() => getRegularityScore(cycleLengths), [cycleLengths]);
  const chartData = cycleLengths.slice(-12); // show up to last 12 cycles
  const avgLength = chartData.length > 0 ? chartData.reduce((a, b) => a + b, 0) / chartData.length : cycleLength;
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

      {/* Regularity Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-[20px] border border-border-light bg-bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent-purple" />
            <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">Cycle Regularity</h3>
          </div>
          {cycleLengths.length >= 2 && (
            <span className="text-xs font-quicksand font-semibold" style={{ color: regularity.color }}>
              {regularity.label}
            </span>
          )}
        </div>
        {cycleLengths.length < 2 ? (
          <p className="text-xs text-text-muted font-quicksand">{regularity.description}</p>
        ) : (
          <>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-cormorant font-semibold text-text-primary">{regularity.score}</span>
              <span className="text-xs text-text-muted font-quicksand mb-1">/ 100</span>
            </div>
            <div className="h-2 rounded-full bg-bg-secondary overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${regularity.score}%`, backgroundColor: regularity.color }}
              />
            </div>
            <p className="text-xs text-text-muted font-quicksand">{regularity.description}</p>
          </>
        )}
      </motion.div>

      {/* Cycle Length Trend Chart */}
      {chartData.length >= 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }} className="rounded-[20px] border border-border-light bg-bg-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent-pink" />
              <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">Cycle Length Trend</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-pink" />
                <span className="text-[10px] text-text-muted font-quicksand">Length</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-0.5 bg-accent-purple" style={{ borderTop: "2px dashed #9333ea" }} />
                <span className="text-[10px] text-text-muted font-quicksand">Avg {Math.round(avgLength)}d</span>
              </div>
            </div>
          </div>
          {(() => {
            const chartH = 100;
            const minLen = Math.max(14, Math.min(...chartData) - 4);
            const maxLen = Math.min(45, Math.max(...chartData) + 4);
            const range = maxLen - minLen;
            const colW = 30;
            const totalW = chartData.length * colW;
            const yPos = (val: number) => chartH - ((val - minLen) / range) * chartH;
            const avgY = yPos(avgLength);

            return (
              <div className="relative" style={{ height: chartH + 20 }}>
                <svg viewBox={`0 0 ${totalW} ${chartH + 4}`} className="w-full" style={{ height: chartH + 4 }} preserveAspectRatio="none">
                  {/* Average dashed line */}
                  <line
                    x1={0} y1={avgY}
                    x2={totalW} y2={avgY}
                    stroke="#9333ea" strokeWidth={1} strokeDasharray="4 3" opacity={0.5}
                  />
                  {/* Area fill under line */}
                  <polygon
                    points={[
                      ...chartData.map((l, i) => `${i * colW + colW / 2},${yPos(l)}`),
                      `${(chartData.length - 1) * colW + colW / 2},${chartH + 4}`,
                      `${colW / 2},${chartH + 4}`,
                    ].join(" ")}
                    fill="#ec489920"
                  />
                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartData.map((l, i) => `${i * colW + colW / 2},${yPos(l)}`).join(" ")}
                  />
                  {/* Dots */}
                  {chartData.map((l, i) => (
                    <circle key={i} cx={i * colW + colW / 2} cy={yPos(l)} r={3} fill="#ec4899" />
                  ))}
                </svg>
                {/* X labels */}
                <div className="flex" style={{ marginTop: 2 }}>
                  {chartData.map((l, i) => (
                    <div key={i} className="text-center font-quicksand" style={{ flex: 1, fontSize: 9, color: "var(--text-muted)" }}>
                      {l}d
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          <p className="text-[10px] text-text-muted font-quicksand mt-1">
            Showing last {chartData.length} cycle{chartData.length !== 1 ? "s" : ""}
          </p>
        </motion.div>
      )}

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

      {/* Past Periods scrollable list */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-6">
        <PastPeriodsList />
      </motion.div>

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
