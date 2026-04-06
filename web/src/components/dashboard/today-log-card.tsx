"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Plus } from "lucide-react";
import { useMoodStore, getMoodColor } from "@/stores/mood-store";

const moodLabels = ["Very Low", "Low", "Neutral", "Good", "Great"];
const flowLabels: Record<string, string> = {
  spotting: "Spotting",
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
};

export function TodayLogCard() {
  const [mounted, setMounted] = useState(false);
  const entries = useMoodStore((s) => s.entries);
  const getLogStreak = useMoodStore((s) => s.getLogStreak);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntry = entries[todayStr];
  const streak = getLogStreak();

  if (todayEntry) {
    const moodColor = getMoodColor(todayEntry.mood);
    const topSymptoms = todayEntry.symptoms.slice(0, 3);

    return (
      <div className="flex items-start gap-4 p-4 rounded-[20px] border border-green-200/60 bg-green-50/40">
        {/* Streak */}
        {streak > 0 && (
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-orange-100 flex-shrink-0">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-quicksand font-bold text-orange-600 leading-none">{streak}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-quicksand font-semibold text-green-700">✓ Logged today</span>
            {streak > 1 && (
              <span className="text-[10px] font-quicksand text-orange-500">{streak} day streak 🔥</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Mood */}
            <span
              className="text-xs font-quicksand font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${moodColor}20`, color: moodColor }}
            >
              Mood: {moodLabels[todayEntry.mood - 1]}
            </span>

            {/* Flow */}
            {todayEntry.flow && (
              <span className="text-xs font-quicksand px-2.5 py-1 rounded-full bg-accent-pink/15 text-accent-pink font-medium">
                Flow: {flowLabels[todayEntry.flow]}
              </span>
            )}

            {/* Top symptoms */}
            {topSymptoms.map((s) => (
              <span
                key={s}
                className="text-xs font-quicksand px-2 py-1 rounded-full bg-bg-secondary text-text-muted capitalize"
              >
                {s.replace(/_/g, " ")}
              </span>
            ))}
            {todayEntry.symptoms.length > 3 && (
              <span className="text-xs text-text-muted font-quicksand">+{todayEntry.symptoms.length - 3} more</span>
            )}
          </div>
        </div>

        <Link
          href="/log"
          className="text-xs font-quicksand text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
        >
          Edit
        </Link>
      </div>
    );
  }

  // Not yet logged
  return (
    <Link
      href="/log"
      className="flex items-center gap-4 p-4 rounded-[20px] border border-border-light bg-bg-card hover:bg-bg-secondary/40 transition-colors group"
    >
      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-accent-purple/10 flex-shrink-0">
        {streak > 0 ? (
          <>
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-quicksand font-bold text-orange-600 leading-none">{streak}</span>
          </>
        ) : (
          <Plus className="h-5 w-5 text-accent-purple" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-quicksand font-semibold text-text-primary text-sm">Log today&apos;s mood</p>
        <p className="text-xs text-text-muted font-quicksand">
          {streak > 0
            ? `${streak} day streak — keep it going!`
            : "Track mood, energy, and symptoms"}
        </p>
      </div>
      <span className="text-xs font-quicksand text-accent-purple font-semibold group-hover:translate-x-0.5 transition-transform">
        Log →
      </span>
    </Link>
  );
}
