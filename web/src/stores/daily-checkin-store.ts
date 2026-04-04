"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SymptomLog } from "./symptom-store";

export type SleepQuality = 1 | 2 | 3 | 4 | 5;
export type WaterIntake = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface LifestyleFactors {
  sleepQuality: SleepQuality | null;
  sleepHours: number | null;
  waterIntake: WaterIntake | null;
  exerciseDone: boolean;
  exerciseType: string | null;
  exerciseMinutes: number | null;
}

export const triggerOptions = [
  { id: "caffeine", label: "Caffeine", icon: "☕" },
  { id: "alcohol", label: "Alcohol", icon: "🍷" },
  { id: "sugar", label: "Sugar", icon: "🍬" },
  { id: "spicy_food", label: "Spicy Food", icon: "🌶️" },
  { id: "dairy", label: "Dairy", icon: "🧀" },
  { id: "gluten", label: "Gluten", icon: "🍞" },
  { id: "stress", label: "Stress", icon: "😫" },
  { id: "poor_sleep", label: "Poor Sleep", icon: "😵" },
  { id: "skipped_meal", label: "Skipped Meal", icon: "🚫" },
  { id: "dehydration", label: "Dehydration", icon: "🏜️" },
  { id: "intense_exercise", label: "Intense Exercise", icon: "🏋️" },
  { id: "weather_change", label: "Weather Change", icon: "🌦️" },
] as const;

export type TriggerId = typeof triggerOptions[number]["id"];

export interface DailyCheckInEntry {
  id: string;
  date: string; // YYYY-MM-DD
  symptoms: SymptomLog[];
  mood: number | null; // 1-5
  energy: number | null; // 1-5
  lifestyle: LifestyleFactors;
  triggers: TriggerId[];
  triggerNotes: string;
  reflection: string;
  moonPhase: string | null;
  createdAt: string;
  updatedAt: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const emptyLifestyle: LifestyleFactors = {
  sleepQuality: null,
  sleepHours: null,
  waterIntake: null,
  exerciseDone: false,
  exerciseType: null,
  exerciseMinutes: null,
};

interface DailyCheckInStore {
  entries: DailyCheckInEntry[];

  saveCheckIn: (data: Omit<DailyCheckInEntry, "id" | "createdAt" | "updatedAt">) => string;
  updateCheckIn: (id: string, data: Partial<Omit<DailyCheckInEntry, "id" | "createdAt">>) => void;
  deleteCheckIn: (id: string) => void;
  getEntryByDate: (date: string) => DailyCheckInEntry | undefined;
  getRecentEntries: (days: number) => DailyCheckInEntry[];
  getEntriesForMonth: (year: number, month: number) => DailyCheckInEntry[];
  getStreakCount: () => number;
  getTotalEntries: () => number;
  getEntriesThisWeek: () => number;
}

export const useDailyCheckInStore = create<DailyCheckInStore>()(
  persist(
    (set, get) => ({
      entries: [],

      saveCheckIn: (data) => {
        const existing = get().entries.find((e) => e.date === data.date);
        const now = new Date().toISOString();

        if (existing) {
          set((state) => ({
            entries: state.entries.map((e) =>
              e.id === existing.id ? { ...e, ...data, updatedAt: now } : e
            ),
          }));
          return existing.id;
        }

        const id = generateId();
        set((state) => ({
          entries: [{ ...data, id, createdAt: now, updatedAt: now }, ...state.entries],
        }));
        return id;
      },

      updateCheckIn: (id, data) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
          ),
        }));
      },

      deleteCheckIn: (id) => {
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
      },

      getEntryByDate: (date) => get().entries.find((e) => e.date === date),

      getRecentEntries: (days) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
        return get()
          .entries.filter((e) => e.date >= cutoffStr)
          .sort((a, b) => b.date.localeCompare(a.date));
      },

      getEntriesForMonth: (year, month) => {
        const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
        return get()
          .entries.filter((e) => e.date.startsWith(prefix))
          .sort((a, b) => b.date.localeCompare(a.date));
      },

      getStreakCount: () => {
        const entries = get().entries;
        if (entries.length === 0) return 0;
        const dates = new Set(entries.map((e) => e.date));
        let streak = 0;
        const d = new Date();
        const todayStr = getTodayStr();
        if (!dates.has(todayStr)) {
          d.setDate(d.getDate() - 1);
        }
        while (true) {
          const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          if (dates.has(ds)) {
            streak++;
            d.setDate(d.getDate() - 1);
          } else {
            break;
          }
        }
        return streak;
      },

      getTotalEntries: () => get().entries.length,

      getEntriesThisWeek: () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startStr = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, "0")}-${String(startOfWeek.getDate()).padStart(2, "0")}`;
        return get().entries.filter((e) => e.date >= startStr).length;
      },
    }),
    {
      name: "luna-daily-checkin-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const sleepQualityLabels: Record<SleepQuality, { label: string; emoji: string }> = {
  1: { label: "Terrible", emoji: "😫" },
  2: { label: "Poor", emoji: "😕" },
  3: { label: "Okay", emoji: "😐" },
  4: { label: "Good", emoji: "😴" },
  5: { label: "Great", emoji: "🌟" },
};

export const exerciseTypes = [
  { id: "walking", label: "Walking", icon: "🚶" },
  { id: "yoga", label: "Yoga", icon: "🧘" },
  { id: "running", label: "Running", icon: "🏃" },
  { id: "strength", label: "Strength", icon: "💪" },
  { id: "swimming", label: "Swimming", icon: "🏊" },
  { id: "cycling", label: "Cycling", icon: "🚴" },
  { id: "stretching", label: "Stretching", icon: "🤸" },
  { id: "dance", label: "Dance", icon: "💃" },
  { id: "other", label: "Other", icon: "🏅" },
] as const;
