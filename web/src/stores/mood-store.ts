"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type FlowIntensity = "spotting" | "light" | "medium" | "heavy";

export interface LocalMoodEntry {
  date: string;
  mood: number;
  energy: number;
  notes?: string;
  cyclePhase?: string;
  dayOfCycle?: number;
  symptoms: string[];
  flow?: FlowIntensity;
  synced: boolean;
}

interface MoodStore {
  entries: Record<string, LocalMoodEntry>;
  setEntry: (entry: LocalMoodEntry) => void;
  getEntry: (date: string) => LocalMoodEntry | undefined;
  deleteEntry: (date: string) => void;
  markSynced: (date: string) => void;
  getEntriesForMonth: (year: number, month: number) => LocalMoodEntry[];
  getUnsyncedEntries: () => LocalMoodEntry[];
  getLogStreak: () => number;
}

export const useMoodStore = create<MoodStore>()(
  persist(
    (set, get) => ({
      entries: {},

      setEntry: (entry) =>
        set((state) => ({
          entries: { ...state.entries, [entry.date]: entry },
        })),

      getEntry: (date) => get().entries[date],

      deleteEntry: (date) =>
        set((state) => {
          const { [date]: _, ...rest } = state.entries;
          return { entries: rest };
        }),

      markSynced: (date) =>
        set((state) => {
          const entry = state.entries[date];
          if (!entry) return state;
          return {
            entries: { ...state.entries, [date]: { ...entry, synced: true } },
          };
        }),

      getEntriesForMonth: (year, month) => {
        const entries = get().entries;
        return Object.values(entries).filter((entry) => {
          const d = new Date(entry.date);
          return d.getFullYear() === year && d.getMonth() === month;
        });
      },

      getUnsyncedEntries: () =>
        Object.values(get().entries).filter((e) => !e.synced),

      getLogStreak: () => {
        const dates = Object.keys(get().entries).sort().reverse();
        if (dates.length === 0) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split("T")[0];
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) return 0;
        const startDay = dates.includes(todayStr) ? today : yesterday;
        let streak = 0;
        for (let i = 0; i <= dates.length; i++) {
          const d = new Date(startDay);
          d.setDate(startDay.getDate() - i);
          if (dates.includes(d.toISOString().split("T")[0])) {
            streak++;
          } else {
            break;
          }
        }
        return streak;
      },
    }),
    {
      name: "luna-mood-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function getMoodColor(mood: number): string {
  const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];
  return colors[Math.max(0, Math.min(4, mood - 1))];
}

export function getEnergyColor(energy: number): string {
  const colors = ["#6b7280", "#9ca3af", "#fbbf24", "#f59e0b", "#f97316"];
  return colors[Math.max(0, Math.min(4, energy - 1))];
}
