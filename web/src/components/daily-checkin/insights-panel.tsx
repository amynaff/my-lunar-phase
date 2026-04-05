"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Zap,
  Bed,
  Droplets,
  Dumbbell,
  AlertTriangle,
  BarChart3,
  Calendar,
  FileText,
  Moon,
} from "lucide-react";
import { useDailyCheckInStore } from "@/stores/daily-checkin-store";
import { useCycleStore } from "@/stores/cycle-store";
import {
  analyzeCheckIns,
  type InsightsSummary,
  type SymptomFrequency,
  type TriggerCorrelation,
} from "@/lib/insights/analyze-checkins";
import { severityConfig, getSymptomById } from "@/stores/symptom-store";
import type { CyclePhase } from "@/lib/cycle/types";
import { phaseInfo } from "@/lib/cycle/data";

// ── Compute phase for a specific date ──
function getPhaseForDate(
  dateStr: string,
  lastPeriodStart: string | null,
  cycleLength: number,
  periodLength: number
): CyclePhase {
  if (!lastPeriodStart) return "follicular";
  const start = new Date(lastPeriodStart);
  const date = new Date(dateStr + "T12:00:00");
  const daysSinceStart = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceStart < 0) return "follicular";
  const dayOfCycle = (((daysSinceStart % cycleLength) + cycleLength) % cycleLength) + 1;
  if (dayOfCycle <= periodLength) return "menstrual";
  if (dayOfCycle <= 13) return "follicular";
  if (dayOfCycle <= 17) return "ovulatory";
  return "luteal";
}

const PHASES: CyclePhase[] = ["menstrual", "follicular", "ovulatory", "luteal"];

type TimeRange = 7 | 14 | 30 | 90;

export function InsightsPanel() {
  const entries = useDailyCheckInStore((s) => s.entries);
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const { lastPeriodStart, cycleLength, periodLength } = useCycleStore();

  const insights = useMemo(() => analyzeCheckIns(entries, timeRange), [entries, timeRange]);

  // Mood by phase data
  const moodByPhase = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    const recent = entries.filter((e) => e.date >= cutoffStr && e.mood !== null);
    const grouped: Record<CyclePhase, number[]> = { menstrual: [], follicular: [], ovulatory: [], luteal: [] };
    for (const entry of recent) {
      if (entry.mood === null) continue;
      const phase = getPhaseForDate(entry.date, lastPeriodStart, cycleLength, periodLength);
      grouped[phase].push(entry.mood);
    }
    return PHASES.map((phase) => ({
      phase,
      avg: grouped[phase].length > 0 ? Math.round((grouped[phase].reduce((a, b) => a + b, 0) / grouped[phase].length) * 10) / 10 : null,
      count: grouped[phase].length,
    }));
  }, [entries, timeRange, lastPeriodStart, cycleLength, periodLength]);

  // Symptom by phase data
  const symptomByPhase = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    const recent = entries.filter((e) => e.date >= cutoffStr);
    // Count symptoms per phase
    const counts: Record<string, Record<CyclePhase, number>> = {};
    for (const entry of recent) {
      const phase = getPhaseForDate(entry.date, lastPeriodStart, cycleLength, periodLength);
      for (const s of entry.symptoms) {
        if (!counts[s.symptomId]) counts[s.symptomId] = { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0 };
        counts[s.symptomId][phase]++;
      }
    }
    const total = (c: Record<CyclePhase, number>) => Object.values(c).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
      .map(([symptomId, phaseCounts]) => {
        const sym = getSymptomById(symptomId);
        const peakPhase = PHASES.reduce((best, p) => phaseCounts[p] > phaseCounts[best] ? p : best, PHASES[0]);
        return { symptomId, name: sym?.name || symptomId, icon: sym?.icon || "?", phaseCounts, peakPhase, total: total(phaseCounts) };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [entries, timeRange, lastPeriodStart, cycleLength, periodLength]);

  if (insights.totalCheckIns === 0) {
    return (
      <div className="rounded-[20px] border border-border-light bg-bg-card p-8 text-center">
        <BarChart3 className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-sm font-quicksand font-semibold text-text-primary mb-1">
          No data yet
        </p>
        <p className="text-xs text-text-muted font-quicksand">
          Start logging daily check-ins to see your patterns and insights here.
          <br />
          We recommend at least 7 days for meaningful trends.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Time range selector */}
      <div className="flex gap-1 p-1 rounded-xl bg-bg-secondary/50">
        {([7, 14, 30, 90] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-quicksand font-semibold transition-colors ${
              timeRange === range
                ? "bg-bg-card text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {range}d
          </button>
        ))}
      </div>

      {/* Overview cards */}
      <OverviewCards insights={insights} />

      {/* Mood & Energy Trend */}
      <MoodEnergyChart trends={insights.moodTrends} />

      {/* Top Symptoms */}
      <TopSymptomsChart symptoms={insights.topSymptoms} totalDays={insights.totalCheckIns} />

      {/* Weekly Breakdown */}
      {insights.weeklySummaries.length > 1 && (
        <WeeklyBreakdown summaries={insights.weeklySummaries} />
      )}

      {/* Mood by Phase */}
      {lastPeriodStart && moodByPhase.some((m) => m.count > 0) && (
        <MoodByPhaseChart data={moodByPhase} />
      )}

      {/* Symptom Frequency by Phase */}
      {symptomByPhase.length > 0 && lastPeriodStart && (
        <SymptomByPhasePanel data={symptomByPhase} />
      )}

      {/* Trigger Correlations */}
      {insights.triggerCorrelations.length > 0 && (
        <CorrelationsCard correlations={insights.triggerCorrelations} />
      )}

      {/* Health Report Button */}
      <HealthReportSection insights={insights} />
    </div>
  );
}

// ── Overview Cards ──
function OverviewCards({ insights }: { insights: InsightsSummary }) {
  const cards = [
    {
      label: "Avg Mood",
      value: insights.avgMood,
      max: 5,
      icon: <Heart className="h-3.5 w-3.5" />,
      color: "text-accent-pink",
      bgColor: "bg-accent-pink/10",
    },
    {
      label: "Avg Energy",
      value: insights.avgEnergy,
      max: 5,
      icon: <Zap className="h-3.5 w-3.5" />,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Avg Sleep",
      value: insights.avgSleep,
      max: 5,
      icon: <Bed className="h-3.5 w-3.5" />,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      label: "Exercise",
      value: insights.exerciseRate,
      max: 100,
      suffix: "%",
      icon: <Dumbbell className="h-3.5 w-3.5" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border-light bg-bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${card.bgColor}`}>
              <span className={card.color}>{card.icon}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-quicksand font-semibold">
              {card.label}
            </span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-cormorant font-semibold text-text-primary">
              {card.value !== null ? (card.suffix ? Math.round(card.value) : card.value) : "—"}
            </span>
            {card.value !== null && !card.suffix && (
              <span className="text-xs text-text-muted font-quicksand mb-1">/ {card.max}</span>
            )}
            {card.suffix && (
              <span className="text-xs text-text-muted font-quicksand mb-1">{card.suffix}</span>
            )}
          </div>
          {/* Mini bar */}
          {card.value !== null && (
            <div className="mt-2 h-1.5 rounded-full bg-bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${card.bgColor.replace("/10", "")}`}
                style={{
                  width: `${Math.min(100, (card.value / card.max) * 100)}%`,
                  backgroundColor: card.color.includes("pink")
                    ? "#ec4899"
                    : card.color.includes("amber")
                    ? "#f59e0b"
                    : card.color.includes("indigo")
                    ? "#6366f1"
                    : "#22c55e",
                }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ── Mood & Energy Trend Chart ──
function MoodEnergyChart({ trends }: { trends: { date: string; mood: number | null; energy: number | null }[] }) {
  if (trends.length < 2) return null;

  const maxPoints = 30;
  const data = trends.slice(-maxPoints);
  const chartHeight = 120;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-quicksand font-semibold text-text-primary">Mood & Energy</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-purple" />
            <span className="text-[10px] text-text-muted font-quicksand">Mood</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-[10px] text-text-muted font-quicksand">Energy</span>
          </div>
        </div>
      </div>

      {/* SVG line chart */}
      <div className="relative" style={{ height: chartHeight }}>
        <svg
          viewBox={`0 0 ${data.length * 24} ${chartHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map((v) => (
            <line
              key={v}
              x1={0}
              y1={chartHeight - (v / 5) * chartHeight}
              x2={data.length * 24}
              y2={chartHeight - (v / 5) * chartHeight}
              stroke="currentColor"
              className="text-border-light"
              strokeWidth={0.5}
              strokeDasharray="4 4"
            />
          ))}

          {/* Mood line */}
          <polyline
            fill="none"
            stroke="#9333ea"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data
              .map((d, i) =>
                d.mood !== null ? `${i * 24 + 12},${chartHeight - (d.mood / 5) * chartHeight}` : null
              )
              .filter(Boolean)
              .join(" ")}
          />

          {/* Energy line */}
          <polyline
            fill="none"
            stroke="#fbbf24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data
              .map((d, i) =>
                d.energy !== null
                  ? `${i * 24 + 12},${chartHeight - (d.energy / 5) * chartHeight}`
                  : null
              )
              .filter(Boolean)
              .join(" ")}
          />

          {/* Mood dots */}
          {data.map((d, i) =>
            d.mood !== null ? (
              <circle
                key={`m-${i}`}
                cx={i * 24 + 12}
                cy={chartHeight - (d.mood / 5) * chartHeight}
                r={3}
                fill="#9333ea"
              />
            ) : null
          )}

          {/* Energy dots */}
          {data.map((d, i) =>
            d.energy !== null ? (
              <circle
                key={`e-${i}`}
                cx={i * 24 + 12}
                cy={chartHeight - (d.energy / 5) * chartHeight}
                r={3}
                fill="#fbbf24"
              />
            ) : null
          )}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none -ml-4">
          {[5, 4, 3, 2, 1].map((v) => (
            <span key={v} className="text-[9px] text-text-muted font-quicksand">
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* X-axis dates */}
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[9px] text-text-muted font-quicksand">
          {new Date(data[0].date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <span className="text-[9px] text-text-muted font-quicksand">
          {new Date(data[data.length - 1].date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
    </motion.div>
  );
}

// ── Top Symptoms Bar Chart ──
function TopSymptomsChart({
  symptoms,
  totalDays,
}: {
  symptoms: SymptomFrequency[];
  totalDays: number;
}) {
  if (symptoms.length === 0) return null;

  const maxCount = Math.max(...symptoms.map((s) => s.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-5"
    >
      <p className="text-sm font-quicksand font-semibold text-text-primary mb-4">
        Top Symptoms
      </p>
      <div className="space-y-3">
        {symptoms.slice(0, 6).map((symptom) => {
          const severityColor =
            symptom.avgSeverity >= 2.5
              ? severityConfig.severe.color
              : symptom.avgSeverity >= 1.5
              ? severityConfig.moderate.color
              : severityConfig.mild.color;

          return (
            <div key={symptom.symptomId}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{symptom.icon}</span>
                  <span className="text-xs font-quicksand font-medium text-text-primary">
                    {symptom.name}
                  </span>
                  {symptom.trend !== "stable" && (
                    <span className="flex items-center">
                      {symptom.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-red-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-green-500" />
                      )}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-text-muted font-quicksand">
                  {symptom.count}x ({symptom.percentage}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(symptom.count / maxCount) * 100}%`,
                    backgroundColor: severityColor,
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-text-muted font-quicksand mt-3">
        Based on {totalDays} check-in{totalDays !== 1 ? "s" : ""}. Bar color reflects average severity.
      </p>
    </motion.div>
  );
}

// ── Weekly Breakdown ──
function WeeklyBreakdown({
  summaries,
}: {
  summaries: { weekLabel: string; avgMood: number | null; avgEnergy: number | null; symptomCount: number; exerciseDays: number; totalDays: number }[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-accent-purple" />
        <p className="text-sm font-quicksand font-semibold text-text-primary">Week by Week</p>
      </div>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-xs font-quicksand">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-text-muted">
              <th className="text-left py-2 pr-3">Week</th>
              <th className="text-center py-2 px-2">Mood</th>
              <th className="text-center py-2 px-2">Energy</th>
              <th className="text-center py-2 px-2">Symptoms</th>
              <th className="text-center py-2 px-2">Exercise</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((week, i) => (
              <tr key={i} className="border-t border-border-light/50">
                <td className="py-2.5 pr-3 text-text-primary font-medium whitespace-nowrap">
                  {week.weekLabel}
                </td>
                <td className="py-2.5 px-2 text-center">
                  {week.avgMood !== null ? (
                    <span className={getMoodTextColor(week.avgMood)}>{week.avgMood}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-2.5 px-2 text-center">
                  {week.avgEnergy !== null ? (
                    <span className={getEnergyTextColor(week.avgEnergy)}>{week.avgEnergy}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-2.5 px-2 text-center text-text-secondary">
                  {week.symptomCount}
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span className="text-green-500">
                    {week.exerciseDays}/{week.totalDays}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ── Trigger Correlations ──
function CorrelationsCard({ correlations }: { correlations: TriggerCorrelation[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <p className="text-sm font-quicksand font-semibold text-text-primary">
          Possible Trigger Patterns
        </p>
      </div>
      <p className="text-[10px] text-text-muted font-quicksand mb-4">
        Symptoms that occur more often on days with these triggers
      </p>
      <div className="space-y-3">
        {correlations.map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-500/5 border border-orange-200/30"
          >
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-sm">{c.triggerIcon}</span>
              <span className="text-xs font-quicksand font-medium text-text-primary truncate">
                {c.triggerLabel}
              </span>
            </div>
            <span className="text-text-muted text-[10px]">→</span>
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-sm">{c.symptomIcon}</span>
              <span className="text-xs font-quicksand text-text-secondary truncate">
                {c.symptomName}
              </span>
            </div>
            <span className="ml-auto text-xs font-quicksand font-semibold text-orange-600 whitespace-nowrap">
              +{c.liftPercent}%
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-text-muted font-quicksand mt-3 italic">
        These patterns are based on your logged data. Discuss with your healthcare provider for personalized guidance.
      </p>
    </motion.div>
  );
}

// ── Mood by Phase Chart ──
function MoodByPhaseChart({ data }: { data: { phase: CyclePhase; avg: number | null; count: number }[] }) {
  const moodEmojis = ["", "😢", "😕", "😐", "🙂", "😊"];
  const hasData = data.some((d) => d.count > 0);
  if (!hasData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Moon className="h-4 w-4 text-accent-purple" />
        <p className="text-sm font-quicksand font-semibold text-text-primary">Mood by Phase</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {data.map(({ phase, avg, count }) => {
          const info = phaseInfo[phase];
          const barHeight = avg !== null ? Math.round((avg / 5) * 60) : 0;
          return (
            <div key={phase} className="flex flex-col items-center gap-1">
              {/* Bar */}
              <div className="relative flex items-end justify-center w-full" style={{ height: 64 }}>
                {avg !== null ? (
                  <div
                    className="w-8 rounded-t-lg transition-all duration-500"
                    style={{ height: barHeight, backgroundColor: info.color, opacity: 0.75 }}
                  />
                ) : (
                  <div className="w-8 rounded-t-lg bg-bg-secondary" style={{ height: 12, opacity: 0.4 }} />
                )}
              </div>
              {/* Value */}
              <span className="text-sm font-cormorant font-semibold text-text-primary">
                {avg !== null ? avg : "—"}
              </span>
              {avg !== null && (
                <span className="text-base leading-none">{moodEmojis[Math.round(avg)] || ""}</span>
              )}
              {/* Phase label */}
              <span className="text-[9px] text-text-muted font-quicksand text-center leading-tight capitalize">
                {phase}
              </span>
              <span className="text-[9px] text-text-muted font-quicksand">
                {count > 0 ? `${count}d` : "no data"}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-text-muted font-quicksand mt-3">
        Average mood (1–5) per cycle phase from your check-ins.
      </p>
    </motion.div>
  );
}

// ── Symptom Frequency by Phase Panel ──
function SymptomByPhasePanel({
  data,
}: {
  data: { symptomId: string; name: string; icon: string; phaseCounts: Record<CyclePhase, number>; peakPhase: CyclePhase; total: number }[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="h-4 w-4 text-accent-pink" />
        <p className="text-sm font-quicksand font-semibold text-text-primary">Symptoms by Phase</p>
      </div>
      <p className="text-[10px] text-text-muted font-quicksand mb-4">
        Top symptoms and which phase they peak in
      </p>
      <div className="space-y-4">
        {data.map((symptom) => {
          const maxCount = Math.max(...PHASES.map((p) => symptom.phaseCounts[p]));
          return (
            <div key={symptom.symptomId}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">{symptom.icon}</span>
                <span className="text-xs font-quicksand font-medium text-text-primary">{symptom.name}</span>
                <span
                  className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-quicksand font-semibold"
                  style={{
                    backgroundColor: phaseInfo[symptom.peakPhase].color + "20",
                    color: phaseInfo[symptom.peakPhase].color,
                  }}
                >
                  peaks in {symptom.peakPhase}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {PHASES.map((phase) => {
                  const count = symptom.phaseCounts[phase];
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={phase} className="flex flex-col gap-0.5">
                      <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: phaseInfo[phase].color, opacity: pct > 0 ? 0.7 : 0 }}
                        />
                      </div>
                      <span className="text-[8px] text-text-muted font-quicksand capitalize truncate">{phase.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-text-muted font-quicksand mt-3">
        Each bar shows relative frequency within that phase.
      </p>
    </motion.div>
  );
}

// ── Health Report Section ──
function HealthReportSection({ insights }: { insights: InsightsSummary }) {
  const [copied, setCopied] = useState(false);

  function generateReport(): string {
    const lines: string[] = [];
    lines.push("═══════════════════════════════════════");
    lines.push("  MY LUNAR PHASE — HEALTH SUMMARY");
    lines.push("═══════════════════════════════════════");
    lines.push("");
    lines.push(`Period: ${formatDate(insights.dateRange.start)} – ${formatDate(insights.dateRange.end)}`);
    lines.push(`Total check-ins: ${insights.totalCheckIns}`);
    lines.push("");

    lines.push("── AVERAGES ──");
    if (insights.avgMood !== null) lines.push(`  Mood:     ${insights.avgMood}/5`);
    if (insights.avgEnergy !== null) lines.push(`  Energy:   ${insights.avgEnergy}/5`);
    if (insights.avgSleep !== null) lines.push(`  Sleep:    ${insights.avgSleep}/5`);
    if (insights.avgWater !== null) lines.push(`  Water:    ${insights.avgWater} glasses/day`);
    lines.push(`  Exercise: ${Math.round(insights.exerciseRate)}% of days`);
    lines.push("");

    if (insights.topSymptoms.length > 0) {
      lines.push("── TOP SYMPTOMS ──");
      for (const s of insights.topSymptoms.slice(0, 8)) {
        const sevLabel =
          s.avgSeverity >= 2.5 ? "severe" : s.avgSeverity >= 1.5 ? "moderate" : "mild";
        const trendArrow = s.trend === "up" ? " ↑" : s.trend === "down" ? " ↓" : "";
        lines.push(`  ${s.name}: ${s.count}x (${s.percentage}% of days, avg ${sevLabel})${trendArrow}`);
      }
      lines.push("");
    }

    if (insights.triggerCorrelations.length > 0) {
      lines.push("── POSSIBLE TRIGGER PATTERNS ──");
      for (const c of insights.triggerCorrelations.slice(0, 5)) {
        lines.push(
          `  ${c.triggerLabel} → ${c.symptomName}: ${c.coOccurrenceRate}% occurrence vs ${c.baselineRate}% baseline (+${c.liftPercent}%)`
        );
      }
      lines.push("");
    }

    if (insights.weeklySummaries.length > 1) {
      lines.push("── WEEKLY TRENDS ──");
      for (const w of insights.weeklySummaries) {
        lines.push(
          `  ${w.weekLabel}: mood ${w.avgMood ?? "—"}, energy ${w.avgEnergy ?? "—"}, ${w.symptomCount} symptoms, exercise ${w.exerciseDays}/${w.totalDays} days`
        );
      }
      lines.push("");
    }

    lines.push("───────────────────────────────────────");
    lines.push("Generated by MyLunarPhase");
    lines.push("Note: This is self-reported data for discussion");
    lines.push("with your healthcare provider.");

    return lines.join("\n");
  }

  async function handleCopy() {
    const report = generateReport();
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = report;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4 text-accent-purple" />
        <p className="text-sm font-quicksand font-semibold text-text-primary">
          Health Report
        </p>
      </div>
      <p className="text-xs text-text-muted font-quicksand mb-4">
        Copy a text summary of your trends to share with your doctor or healthcare provider.
      </p>
      <button
        onClick={handleCopy}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-quicksand font-semibold transition-all ${
          copied
            ? "bg-green-500 text-white"
            : "bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20"
        }`}
      >
        <FileText className="h-4 w-4" />
        {copied ? "Copied to clipboard!" : "Copy Health Report"}
      </button>
    </motion.div>
  );
}

// ── Helpers ──

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getMoodTextColor(mood: number): string {
  if (mood >= 4) return "text-green-500 font-semibold";
  if (mood >= 3) return "text-amber-500 font-medium";
  return "text-red-400 font-medium";
}

function getEnergyTextColor(energy: number): string {
  if (energy >= 4) return "text-amber-500 font-semibold";
  if (energy >= 3) return "text-amber-400 font-medium";
  return "text-gray-400 font-medium";
}
