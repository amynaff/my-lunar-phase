"use client";

import { useMemo } from "react";
import { Droplets } from "lucide-react";
import { useCycleStore } from "@/stores/cycle-store";
import { useMoodStore } from "@/stores/mood-store";

const symptomLabels: Record<string, string> = {
  cramps: "Cramps", bloating: "Bloating", headache: "Headache",
  tender_breasts: "Tender Breasts", backache: "Backache", fatigue: "Fatigue",
  nausea: "Nausea", acne: "Acne", hot_flashes: "Hot Flashes", insomnia: "Insomnia",
  anxious: "Anxious", irritable: "Irritable", brain_fog: "Brain Fog",
  emotional: "Emotional", calm: "Calm", motivated: "Motivated",
  social: "Social", low_libido: "Low Libido", high_libido: "High Libido", stressed: "Stressed",
};

const flowColors: Record<string, string> = {
  spotting: "#f9a8d4",
  light: "#f472b6",
  medium: "#ec4899",
  heavy: "#be185d",
};

const flowLabels: Record<string, string> = {
  spotting: "Spotting",
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
};

function datesBetween(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const curr = new Date(startStr + "T12:00:00");
  const end = new Date(endStr + "T12:00:00");
  while (curr <= end) {
    dates.push(curr.toISOString().split("T")[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function periodDuration(start: string, end: string | null): string {
  if (!end) return "Ongoing";
  const s = new Date(start + "T12:00:00");
  const e = new Date(end + "T12:00:00");
  const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return `${days} day${days !== 1 ? "s" : ""}`;
}

export function PastPeriodsList() {
  const { periodLogs } = useCycleStore();
  const { entries } = useMoodStore();

  const enrichedLogs = useMemo(() => {
    const sorted = [...periodLogs]
      .filter((l) => l.startDate)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));

    return sorted.map((log) => {
      const endDate = log.endDate ?? log.startDate;
      const days = datesBetween(log.startDate, endDate);

      // Aggregate symptoms and flows across logged days during this period
      const symptomCounts: Record<string, number> = {};
      const flowCounts: Record<string, number> = {};
      let totalLogged = 0;

      for (const day of days) {
        const entry = entries[day];
        if (!entry) continue;
        totalLogged++;
        for (const sym of entry.symptoms) {
          symptomCounts[sym] = (symptomCounts[sym] ?? 0) + 1;
        }
        if (entry.flow) {
          flowCounts[entry.flow] = (flowCounts[entry.flow] ?? 0) + 1;
        }
      }

      // Top 4 symptoms
      const topSymptoms = Object.entries(symptomCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([sym]) => symptomLabels[sym] ?? sym);

      // Dominant flow
      const dominantFlow = Object.entries(flowCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      return {
        ...log,
        duration: periodDuration(log.startDate, log.endDate),
        topSymptoms,
        dominantFlow,
        hasLogData: totalLogged > 0,
      };
    });
  }, [periodLogs, entries]);

  if (enrichedLogs.length === 0) {
    return (
      <div className="rounded-[20px] border border-border-light bg-bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="h-4 w-4 text-accent-pink" />
          <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
            Past Periods
          </h3>
        </div>
        <p className="text-xs text-text-muted font-quicksand">
          No period logs yet. Tap &ldquo;Log Period Start&rdquo; to begin tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-border-light bg-bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-accent-pink" />
          <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
            Past Periods
          </h3>
        </div>
        <span className="text-[10px] text-text-muted font-quicksand">
          {enrichedLogs.length} logged
        </span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {enrichedLogs.map((log) => (
          <div
            key={log.id}
            className="rounded-xl border border-border-light bg-bg-secondary p-3"
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-quicksand font-semibold text-text-primary">
                  {formatDate(log.startDate)}
                </p>
                {log.endDate && (
                  <p className="text-[10px] text-text-muted font-quicksand">
                    → {formatDate(log.endDate)} &middot; {log.duration}
                  </p>
                )}
                {!log.endDate && (
                  <p className="text-[10px] text-accent-pink font-quicksand font-semibold">
                    Ongoing
                  </p>
                )}
              </div>

              {/* Flow badge */}
              {log.dominantFlow && (
                <span
                  className="text-[10px] font-quicksand font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: flowColors[log.dominantFlow] ?? "#ec4899" }}
                >
                  {flowLabels[log.dominantFlow]}
                </span>
              )}
            </div>

            {/* Symptom chips */}
            {log.topSymptoms.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {log.topSymptoms.map((sym) => (
                  <span
                    key={sym}
                    className="text-[10px] font-quicksand px-2 py-0.5 rounded-full bg-accent-pink/10 text-accent-pink"
                  >
                    {sym}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-text-muted font-quicksand italic">
                No symptoms logged for this period
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
