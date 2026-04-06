"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Activity, Calendar, Droplets, Flame } from "lucide-react";
import Link from "next/link";
import { useMoodStore } from "@/stores/mood-store";
import { useCycleStore } from "@/stores/cycle-store";
import { SymptomSummary } from "@/components/mood/symptom-summary";
import { MoodByPhase } from "@/components/mood/mood-by-phase";
import { MoodHeatmap } from "@/components/mood/mood-heatmap";
import { MoodTrendChart } from "@/components/mood/mood-trend-chart";

// Compute simple stats from entries
function useInsightStats() {
  const { entries } = useMoodStore();
  const { periodLogs } = useCycleStore();

  return useMemo(() => {
    const allEntries = Object.values(entries);
    if (allEntries.length === 0) return null;

    const avgMood =
      allEntries.reduce((sum, e) => sum + e.mood, 0) / allEntries.length;
    const avgEnergy =
      allEntries.reduce((sum, e) => sum + e.energy, 0) / allEntries.length;

    // Best mood day of week
    const byDow: Record<number, number[]> = {};
    for (const e of allEntries) {
      const dow = new Date(e.date + "T12:00:00").getDay();
      if (!byDow[dow]) byDow[dow] = [];
      byDow[dow].push(e.mood);
    }
    const dowAvgs = Object.entries(byDow).map(([dow, moods]) => ({
      dow: Number(dow),
      avg: moods.reduce((a, b) => a + b, 0) / moods.length,
    }));
    const bestDow = dowAvgs.sort((a, b) => b.avg - a.avg)[0];
    const DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // 30-day streak
    const streak = useMoodStore.getState().getLogStreak();

    // Total logs
    const totalLogs = allEntries.length;

    // Completed periods
    const completedPeriods = periodLogs.filter((l) => l.startDate && l.endDate).length;

    return {
      avgMood: avgMood.toFixed(1),
      avgEnergy: avgEnergy.toFixed(1),
      bestDay: bestDow ? DOW_NAMES[bestDow.dow] : null,
      streak,
      totalLogs,
      completedPeriods,
    };
  }, [entries, periodLogs]);
}

export default function InsightsPage() {
  const stats = useInsightStats();
  const { entries } = useMoodStore();
  const hasData = Object.keys(entries).length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-purple/15">
            <BarChart3 className="h-5 w-5 text-accent-purple" />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">Insights</h1>
            <p className="text-sm text-text-secondary font-quicksand">
              Patterns and trends from your logs
            </p>
          </div>
        </div>
      </motion.div>

      {!hasData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] border border-border-light bg-bg-card p-8 text-center"
        >
          <BarChart3 className="h-10 w-10 text-text-muted mx-auto mb-3 opacity-40" />
          <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-2">
            No data yet
          </h2>
          <p className="text-sm text-text-secondary font-quicksand mb-4">
            Start logging your mood and symptoms daily to unlock personalised insights.
          </p>
          <Link
            href="/log"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold text-sm"
          >
            Log Today
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Stats overview */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-3 gap-3 mb-6"
            >
              <div className="rounded-2xl border border-border-light bg-bg-card p-4 text-center">
                <TrendingUp className="h-4 w-4 text-accent-purple mx-auto mb-1" />
                <p className="text-xl font-cormorant font-semibold text-text-primary">{stats.avgMood}</p>
                <p className="text-[10px] text-text-muted font-quicksand uppercase tracking-wider">Avg Mood</p>
              </div>
              <div className="rounded-2xl border border-border-light bg-bg-card p-4 text-center">
                <Activity className="h-4 w-4 text-accent-pink mx-auto mb-1" />
                <p className="text-xl font-cormorant font-semibold text-text-primary">{stats.avgEnergy}</p>
                <p className="text-[10px] text-text-muted font-quicksand uppercase tracking-wider">Avg Energy</p>
              </div>
              <div className="rounded-2xl border border-border-light bg-bg-card p-4 text-center">
                <Flame className="h-4 w-4 text-orange-400 mx-auto mb-1" />
                <p className="text-xl font-cormorant font-semibold text-text-primary">{stats.streak}</p>
                <p className="text-[10px] text-text-muted font-quicksand uppercase tracking-wider">Day Streak</p>
              </div>
            </motion.div>
          )}

          {/* Quick facts row */}
          {stats && (stats.bestDay || stats.totalLogs > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-[20px] border border-border-light bg-bg-card p-5 mb-6"
            >
              <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-3">
                Quick Facts
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm font-quicksand">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-accent-purple shrink-0" />
                  <span className="text-text-secondary">
                    <span className="font-semibold text-text-primary">{stats.totalLogs}</span> total log entries
                  </span>
                </div>
                {stats.bestDay && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="text-text-secondary">
                      Best mood on <span className="font-semibold text-text-primary">{stats.bestDay}s</span>
                    </span>
                  </div>
                )}
                {stats.completedPeriods > 0 && (
                  <div className="flex items-center gap-2">
                    <Droplets className="h-3.5 w-3.5 text-accent-pink shrink-0" />
                    <span className="text-text-secondary">
                      <span className="font-semibold text-text-primary">{stats.completedPeriods}</span> periods logged
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Mood trend chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <MoodTrendChart />
          </motion.div>

          {/* Mood heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-6"
          >
            <MoodHeatmap />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Symptom summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
            >
              <SymptomSummary />
            </motion.div>

            {/* Mood by phase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              <MoodByPhase />
            </motion.div>
          </div>

          {/* CTA to log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex gap-3"
          >
            <Link
              href="/log"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold text-sm text-center"
            >
              Log Today
            </Link>
            <Link
              href="/cycle-history"
              className="flex-1 py-3 rounded-2xl border border-border-light bg-bg-card font-quicksand font-semibold text-sm text-center text-text-secondary"
            >
              Cycle History
            </Link>
          </motion.div>
        </>
      )}
    </div>
  );
}
