"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";
import { useMoodStore } from "@/stores/mood-store";

const DAYS = 30;

// Friendly display names for symptom keys
const symptomLabels: Record<string, string> = {
  cramps: "Cramps", bloating: "Bloating", headache: "Headache",
  tender_breasts: "Tender Breasts", backache: "Backache", fatigue: "Fatigue",
  nausea: "Nausea", acne: "Acne", hot_flashes: "Hot Flashes", insomnia: "Insomnia",
  anxious: "Anxious", irritable: "Irritable", brain_fog: "Brain Fog",
  emotional: "Emotional", calm: "Calm", motivated: "Motivated",
  social: "Social", low_libido: "Low Libido", high_libido: "High Libido", stressed: "Stressed",
};

const symptomColors: Record<string, string> = {
  cramps: "#ec4899", bloating: "#f59e0b", headache: "#8b5cf6", tender_breasts: "#ec4899",
  backache: "#f97316", fatigue: "#6366f1", nausea: "#14b8a6", acne: "#f43f5e",
  hot_flashes: "#ef4444", insomnia: "#6366f1", anxious: "#f59e0b", irritable: "#ef4444",
  brain_fog: "#8b5cf6", emotional: "#ec4899", calm: "#22c55e", motivated: "#10b981",
  social: "#06b6d4", low_libido: "#94a3b8", high_libido: "#ec4899", stressed: "#f97316",
};

export function SymptomSummary() {
  const { entries } = useMoodStore();

  const topSymptoms = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - DAYS);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const counts: Record<string, number> = {};
    const totalDays = Object.keys(entries).filter((d) => d >= cutoffStr).length;

    for (const [date, entry] of Object.entries(entries)) {
      if (date < cutoffStr) continue;
      for (const sym of entry.symptoms) {
        counts[sym] = (counts[sym] ?? 0) + 1;
      }
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([sym, count]) => ({
        sym,
        count,
        label: symptomLabels[sym] ?? sym,
        color: symptomColors[sym] ?? "#9333ea",
        pct: totalDays > 0 ? Math.round((count / totalDays) * 100) : 0,
      }));
  }, [entries]);

  if (topSymptoms.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[20px] border border-border-light bg-bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-accent-pink" />
        <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
          Top Symptoms — Last 30 Days
        </h3>
      </div>

      <div className="space-y-2.5">
        {topSymptoms.map(({ sym, label, count, color, pct }) => (
          <div key={sym}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-quicksand text-text-primary">{label}</span>
              <span className="text-xs font-quicksand text-text-muted">
                {count}× &middot; {pct}% of days
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-text-muted font-quicksand mt-3">
        Based on your logged entries
      </p>
    </div>
  );
}
