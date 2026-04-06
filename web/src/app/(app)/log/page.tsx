"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Flame, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { MoodEntryForm } from "@/components/mood/mood-entry-form";
import { useMoodStore } from "@/stores/mood-store";
import { useCycleData } from "@/hooks/use-cycle-data";
import Link from "next/link";

export default function LogPage() {
  const { getEntry, getLogStreak } = useMoodStore();
  const { currentPhaseInfo, dayOfCycle, isRegular } = useCycleData();

  const today = new Date().toISOString().split("T")[0];
  const todayEntry = getEntry(today);
  const streak = getLogStreak();

  const [editMode, setEditMode] = useState(false);

  // Re-check entry after form save
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const moodLabels = ["", "Very Low", "Low", "Neutral", "Good", "Great"];
  const energyLabels = ["", "Exhausted", "Low", "Moderate", "High", "Energized"];

  const phaseLabel = isRegular && currentPhaseInfo
    ? `Day ${dayOfCycle} · ${currentPhaseInfo.name}`
    : "Today's Check-in";

  const phaseColor = isRegular ? currentPhaseInfo.color : "#9d84ed";

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Daily Log
            </h1>
            <p className="text-sm font-quicksand mt-0.5" style={{ color: phaseColor }}>
              {phaseLabel}
            </p>
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-pink/10 border border-accent-pink/20">
              <Flame className="h-4 w-4 text-accent-pink" />
              <span className="text-sm font-quicksand font-bold text-accent-pink">
                {streak}
              </span>
              <span className="text-xs font-quicksand text-text-muted hidden sm:inline">day streak</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Already logged today */}
      {todayEntry && !editMode ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="rounded-[20px] border border-border-light bg-bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-quicksand font-semibold text-sm text-text-primary">
                  Logged today
                </span>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 text-xs font-quicksand text-text-muted hover:text-text-primary transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted font-quicksand font-semibold mb-1">
                  Mood
                </p>
                <p className="font-quicksand font-bold text-text-primary">
                  {moodLabels[todayEntry.mood] ?? todayEntry.mood}
                </p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <div
                      key={v}
                      className={`h-1.5 flex-1 rounded-full ${v <= todayEntry.mood ? "bg-accent-purple" : "bg-border-light"}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted font-quicksand font-semibold mb-1">
                  Energy
                </p>
                <p className="font-quicksand font-bold text-text-primary">
                  {energyLabels[todayEntry.energy] ?? todayEntry.energy}
                </p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <div
                      key={v}
                      className={`h-1.5 flex-1 rounded-full ${v <= todayEntry.energy ? "bg-accent-pink" : "bg-border-light"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {todayEntry.symptoms && todayEntry.symptoms.length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-text-muted font-quicksand font-semibold mb-2">
                  Symptoms
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {todayEntry.symptoms.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-full bg-accent-purple/10 text-accent-purple text-xs font-quicksand font-medium capitalize"
                    >
                      {s.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {todayEntry.flow && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-text-muted font-quicksand font-semibold mb-1">
                  Flow
                </p>
                <span className="px-2.5 py-1 rounded-full bg-accent-pink/10 text-accent-pink text-xs font-quicksand font-medium capitalize">
                  {todayEntry.flow}
                </span>
              </div>
            )}

            {todayEntry.notes && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-text-muted font-quicksand font-semibold mb-1">
                  Notes
                </p>
                <p className="text-sm font-quicksand text-text-secondary leading-relaxed">
                  {todayEntry.notes}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/insights"
              className="flex flex-col items-center justify-center gap-1 p-4 rounded-[18px] border border-border-light bg-bg-card hover:bg-bg-secondary/50 transition-colors"
            >
              <span className="text-2xl">📊</span>
              <span className="text-xs font-quicksand font-medium text-text-secondary">View Insights</span>
            </Link>
            <Link
              href="/journal"
              className="flex flex-col items-center justify-center gap-1 p-4 rounded-[18px] border border-border-light bg-bg-card hover:bg-bg-secondary/50 transition-colors"
            >
              <span className="text-2xl">📓</span>
              <span className="text-xs font-quicksand font-medium text-text-secondary">Journal</span>
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={editMode ? "edit" : "new"}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {editMode && (
            <button
              onClick={() => setEditMode(false)}
              className="mb-4 text-xs font-quicksand text-text-muted hover:text-text-primary transition-colors"
            >
              ← Back to summary
            </button>
          )}
          <MoodEntryForm />
        </motion.div>
      )}
    </div>
  );
}
