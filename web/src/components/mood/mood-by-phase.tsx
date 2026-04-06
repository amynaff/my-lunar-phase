"use client";

import { useMemo } from "react";
import { BarChart2 } from "lucide-react";
import { useMoodStore } from "@/stores/mood-store";
import { useCycleStore } from "@/stores/cycle-store";

type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";

interface PhaseConfig {
  label: string;
  emoji: string;
  color: string;
  days: (cycleLength: number, periodLength: number) => [number, number]; // [start, end] inclusive (1-indexed)
}

const PHASES: Record<Phase, PhaseConfig> = {
  menstrual: {
    label: "Menstrual",
    emoji: "🌑",
    color: "#ec4899",
    days: (_, periodLength) => [1, periodLength],
  },
  follicular: {
    label: "Follicular",
    emoji: "🌒",
    color: "#f59e0b",
    days: (_, periodLength) => [periodLength + 1, 13],
  },
  ovulation: {
    label: "Ovulation",
    emoji: "🌕",
    color: "#22c55e",
    days: () => [14, 16],
  },
  luteal: {
    label: "Luteal",
    emoji: "🌘",
    color: "#8b5cf6",
    days: (cycleLength) => [17, cycleLength],
  },
};

function getPhaseForDay(day: number, cycleLength: number, periodLength: number): Phase {
  const [, menEnd] = PHASES.menstrual.days(cycleLength, periodLength);
  const [, folEnd] = PHASES.follicular.days(cycleLength, periodLength);
  const [, ovEnd] = PHASES.ovulation.days(cycleLength, periodLength);
  if (day <= menEnd) return "menstrual";
  if (day <= folEnd) return "follicular";
  if (day <= ovEnd) return "ovulation";
  return "luteal";
}

export function MoodByPhase() {
  const { entries } = useMoodStore();
  const { lastPeriodStart, cycleLength, periodLength } = useCycleStore();

  const phaseAverages = useMemo(() => {
    if (!lastPeriodStart) return null;

    const buckets: Record<Phase, { moods: number[]; energies: number[] }> = {
      menstrual: { moods: [], energies: [] },
      follicular: { moods: [], energies: [] },
      ovulation: { moods: [], energies: [] },
      luteal: { moods: [], energies: [] },
    };

    for (const [dateStr, entry] of Object.entries(entries)) {
      const date = new Date(dateStr + "T12:00:00");
      const periodStart = new Date(lastPeriodStart + "T12:00:00");
      const daysSinceStart = Math.floor((date.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
      const day = (daysSinceStart % cycleLength) + 1;
      if (day < 1 || day > cycleLength) continue;
      const phase = getPhaseForDay(day, cycleLength, periodLength);
      buckets[phase].moods.push(entry.mood);
      buckets[phase].energies.push(entry.energy);
    }

    return (Object.entries(buckets) as [Phase, { moods: number[]; energies: number[] }][]).map(
      ([phase, { moods, energies }]) => {
        const cfg = PHASES[phase];
        const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : null;
        const avgEnergy = energies.length > 0 ? energies.reduce((a, b) => a + b, 0) / energies.length : null;
        return {
          phase,
          label: cfg.label,
          emoji: cfg.emoji,
          color: cfg.color,
          avgMood,
          avgEnergy,
          count: moods.length,
        };
      }
    );
  }, [entries, lastPeriodStart, cycleLength, periodLength]);

  if (!phaseAverages || phaseAverages.every((p) => p.count === 0)) {
    return null;
  }

  const hasData = phaseAverages.some((p) => p.count > 0);
  if (!hasData) return null;

  return (
    <div className="rounded-[20px] border border-border-light bg-bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="h-4 w-4 text-accent-purple" />
        <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
          Mood by Cycle Phase
        </h3>
      </div>

      <div className="space-y-3">
        {phaseAverages.map(({ phase, label, emoji, color, avgMood, avgEnergy, count }) => {
          if (count === 0) {
            return (
              <div key={phase} className="flex items-center gap-3 opacity-40">
                <span className="text-base w-5 text-center">{emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-quicksand text-text-secondary">{label}</span>
                    <span className="text-[10px] text-text-muted font-quicksand">No data</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-secondary" />
                </div>
              </div>
            );
          }

          const moodPct = avgMood != null ? (avgMood / 5) * 100 : 0;

          return (
            <div key={phase} className="flex items-center gap-3">
              <span className="text-base w-5 text-center">{emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-quicksand text-text-primary font-medium">{label}</span>
                  <div className="flex items-center gap-2">
                    {avgMood != null && (
                      <span className="text-[10px] font-quicksand text-text-muted">
                        😊 {avgMood.toFixed(1)}
                      </span>
                    )}
                    {avgEnergy != null && (
                      <span className="text-[10px] font-quicksand text-text-muted">
                        ⚡ {avgEnergy.toFixed(1)}
                      </span>
                    )}
                    <span className="text-[10px] text-text-muted font-quicksand">
                      ({count})
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${moodPct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-text-muted font-quicksand mt-3">
        Average mood (1–5) per phase · {Object.values(entries).length} total entries
      </p>
    </div>
  );
}
