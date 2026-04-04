import { triggerOptions, type DailyCheckInEntry, type TriggerId } from "@/stores/daily-checkin-store";
import { getSymptomById, type SymptomSeverity } from "@/stores/symptom-store";

// ── Types ──

export interface SymptomFrequency {
  symptomId: string;
  name: string;
  icon: string;
  count: number;
  percentage: number; // % of days logged
  avgSeverity: number; // 1=mild, 2=moderate, 3=severe
  trend: "up" | "down" | "stable"; // compared to prior period
}

export interface TriggerCorrelation {
  triggerId: TriggerId;
  triggerLabel: string;
  triggerIcon: string;
  symptomId: string;
  symptomName: string;
  symptomIcon: string;
  coOccurrenceRate: number; // % of trigger days that also had this symptom
  baselineRate: number; // % of non-trigger days with this symptom
  liftPercent: number; // how much more likely with trigger vs without
}

export interface MoodTrend {
  date: string;
  mood: number | null;
  energy: number | null;
}

export interface WeeklySummary {
  weekLabel: string;
  startDate: string;
  avgMood: number | null;
  avgEnergy: number | null;
  avgSleep: number | null;
  avgWater: number | null;
  symptomCount: number;
  exerciseDays: number;
  totalDays: number;
}

export interface InsightsSummary {
  totalCheckIns: number;
  dateRange: { start: string; end: string };
  topSymptoms: SymptomFrequency[];
  triggerCorrelations: TriggerCorrelation[];
  moodTrends: MoodTrend[];
  weeklySummaries: WeeklySummary[];
  avgMood: number | null;
  avgEnergy: number | null;
  avgSleep: number | null;
  avgWater: number | null;
  exerciseRate: number; // % of days with exercise
}

// ── Severity helpers ──

const severityValue: Record<SymptomSeverity, number> = {
  mild: 1,
  moderate: 2,
  severe: 3,
};

// ── Analysis Functions ──

export function analyzeCheckIns(
  entries: DailyCheckInEntry[],
  days: number = 30
): InsightsSummary {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;

  const recent = entries
    .filter((e) => e.date >= cutoffStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (recent.length === 0) {
    return emptyInsights();
  }

  // For trend comparison, get prior period entries
  const priorCutoff = new Date(cutoff);
  priorCutoff.setDate(priorCutoff.getDate() - days);
  const priorCutoffStr = `${priorCutoff.getFullYear()}-${String(priorCutoff.getMonth() + 1).padStart(2, "0")}-${String(priorCutoff.getDate()).padStart(2, "0")}`;
  const prior = entries.filter((e) => e.date >= priorCutoffStr && e.date < cutoffStr);

  return {
    totalCheckIns: recent.length,
    dateRange: { start: recent[0].date, end: recent[recent.length - 1].date },
    topSymptoms: getTopSymptoms(recent, prior),
    triggerCorrelations: getTriggerCorrelations(recent),
    moodTrends: getMoodTrends(recent),
    weeklySummaries: getWeeklySummaries(recent),
    avgMood: avg(recent.map((e) => e.mood).filter(nonNull)),
    avgEnergy: avg(recent.map((e) => e.energy).filter(nonNull)),
    avgSleep: avg(
      recent.map((e) => e.lifestyle.sleepQuality).filter(nonNull)
    ),
    avgWater: avg(
      recent.map((e) => e.lifestyle.waterIntake).filter(nonNull)
    ),
    exerciseRate:
      (recent.filter((e) => e.lifestyle.exerciseDone).length / recent.length) * 100,
  };
}

function getTopSymptoms(
  recent: DailyCheckInEntry[],
  prior: DailyCheckInEntry[]
): SymptomFrequency[] {
  const counts: Record<string, { count: number; totalSeverity: number }> = {};

  for (const entry of recent) {
    for (const s of entry.symptoms) {
      if (!counts[s.symptomId]) counts[s.symptomId] = { count: 0, totalSeverity: 0 };
      counts[s.symptomId].count++;
      counts[s.symptomId].totalSeverity += severityValue[s.severity];
    }
  }

  // Prior period counts for trend
  const priorCounts: Record<string, number> = {};
  for (const entry of prior) {
    for (const s of entry.symptoms) {
      priorCounts[s.symptomId] = (priorCounts[s.symptomId] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([symptomId, data]) => {
      const sym = getSymptomById(symptomId);
      const priorRate = prior.length > 0 ? (priorCounts[symptomId] || 0) / prior.length : 0;
      const currentRate = data.count / recent.length;
      const diff = currentRate - priorRate;

      let trend: "up" | "down" | "stable" = "stable";
      if (prior.length >= 3) {
        if (diff > 0.1) trend = "up";
        else if (diff < -0.1) trend = "down";
      }

      return {
        symptomId,
        name: sym?.name || symptomId,
        icon: sym?.icon || "?",
        count: data.count,
        percentage: Math.round(currentRate * 100),
        avgSeverity: data.totalSeverity / data.count,
        trend,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getTriggerCorrelations(entries: DailyCheckInEntry[]): TriggerCorrelation[] {
  if (entries.length < 5) return [];

  const correlations: TriggerCorrelation[] = [];

  // Get all unique symptom IDs
  const allSymptomIds = new Set<string>();
  for (const e of entries) {
    for (const s of e.symptoms) allSymptomIds.add(s.symptomId);
  }

  // Get all unique trigger IDs
  const allTriggerIds = new Set<string>();
  for (const e of entries) {
    for (const t of e.triggers) allTriggerIds.add(t);
  }

  for (const triggerId of allTriggerIds) {
    const triggerDays = entries.filter((e) => e.triggers.includes(triggerId as TriggerId));
    const nonTriggerDays = entries.filter((e) => !e.triggers.includes(triggerId as TriggerId));

    if (triggerDays.length < 2 || nonTriggerDays.length < 2) continue;

    for (const symptomId of allSymptomIds) {
      const triggerWithSymptom = triggerDays.filter((e) =>
        e.symptoms.some((s) => s.symptomId === symptomId)
      ).length;
      const baselineWithSymptom = nonTriggerDays.filter((e) =>
        e.symptoms.some((s) => s.symptomId === symptomId)
      ).length;

      const coOccurrenceRate = triggerWithSymptom / triggerDays.length;
      const baselineRate = baselineWithSymptom / nonTriggerDays.length;

      // Only report if there's a meaningful lift (>25% more likely)
      if (baselineRate > 0 && coOccurrenceRate / baselineRate > 1.25 && triggerWithSymptom >= 2) {
        const trigger = triggerOptions.find((t: { id: string }) => t.id === triggerId);
        const sym = getSymptomById(symptomId);
        if (!trigger || !sym) continue;

        correlations.push({
          triggerId: triggerId as TriggerId,
          triggerLabel: trigger.label,
          triggerIcon: trigger.icon,
          symptomId,
          symptomName: sym.name,
          symptomIcon: sym.icon,
          coOccurrenceRate: Math.round(coOccurrenceRate * 100),
          baselineRate: Math.round(baselineRate * 100),
          liftPercent: Math.round(((coOccurrenceRate - baselineRate) / baselineRate) * 100),
        });
      }
    }
  }

  return correlations.sort((a, b) => b.liftPercent - a.liftPercent).slice(0, 8);
}

function getMoodTrends(entries: DailyCheckInEntry[]): MoodTrend[] {
  return entries.map((e) => ({
    date: e.date,
    mood: e.mood,
    energy: e.energy,
  }));
}

function getWeeklySummaries(entries: DailyCheckInEntry[]): WeeklySummary[] {
  if (entries.length === 0) return [];

  // Group by week (Sunday start)
  const weeks: Record<string, DailyCheckInEntry[]> = {};
  for (const entry of entries) {
    const d = new Date(entry.date + "T12:00:00");
    const dayOfWeek = d.getDay();
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - dayOfWeek);
    const key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push(entry);
  }

  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([startDate, weekEntries]) => {
      const d = new Date(startDate + "T12:00:00");
      const weekLabel = `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

      const moods = weekEntries.map((e) => e.mood).filter(nonNull);
      const energies = weekEntries.map((e) => e.energy).filter(nonNull);
      const sleeps = weekEntries.map((e) => e.lifestyle.sleepQuality).filter(nonNull);
      const waters = weekEntries.map((e) => e.lifestyle.waterIntake).filter(nonNull);

      return {
        weekLabel,
        startDate,
        avgMood: avg(moods),
        avgEnergy: avg(energies),
        avgSleep: avg(sleeps),
        avgWater: avg(waters),
        symptomCount: weekEntries.reduce((sum, e) => sum + e.symptoms.length, 0),
        exerciseDays: weekEntries.filter((e) => e.lifestyle.exerciseDone).length,
        totalDays: weekEntries.length,
      };
    });
}

// ── Utilities ──

function nonNull<T>(v: T | null | undefined): v is T {
  return v != null;
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function emptyInsights(): InsightsSummary {
  return {
    totalCheckIns: 0,
    dateRange: { start: "", end: "" },
    topSymptoms: [],
    triggerCorrelations: [],
    moodTrends: [],
    weeklySummaries: [],
    avgMood: null,
    avgEnergy: null,
    avgSleep: null,
    avgWater: null,
    exerciseRate: 0,
  };
}
