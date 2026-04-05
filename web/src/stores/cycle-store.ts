"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CyclePhase, LifeStage } from "@/lib/cycle/types";
import { getCurrentPhase, getDayOfCycle, getPhaseProgress, getNextPeriodDate, getDaysUntilNextPeriod } from "@/lib/cycle/phase-calculator";

export interface PeriodLog {
  id: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string | null; // null if period is still ongoing
}

export interface GroceryItem {
  id: string;
  name: string;
  phase: CyclePhase;
  category: string;
  isChecked: boolean;
}

interface CycleStore {
  lastPeriodStart: string | null;
  cycleLength: number;
  periodLength: number;
  hasCompletedOnboarding: boolean;
  lifeStage: LifeStage;
  groceryList: GroceryItem[];
  periodLogs: PeriodLog[];
  profileName: string;
  profileBirthYear: number | null;

  setLastPeriodStart: (date: Date) => void;
  setCycleLength: (days: number) => void;
  setPeriodLength: (days: number) => void;
  setLifeStage: (stage: LifeStage) => void;
  setProfile: (name: string, birthYear: number | null) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  logPeriodStart: (date: Date) => void;
  logPeriodEnd: (date: Date) => void;
  removePeriodLog: (id: string) => void;
  getAverageCycleLength: () => number;
  getAveragePeriodLength: () => number;
  getPredictedOvulation: () => Date | null;
  getPredictedNextPeriod: () => Date | null;

  toggleGroceryItem: (id: string) => void;
  clearGroceryList: () => void;
  addPhaseGroceries: (phase: CyclePhase, items: Array<{ name: string; category: string }>) => void;

  getCurrentPhase: () => CyclePhase;
  getDayOfCycle: () => number;
  getPhaseProgress: () => number;
  getNextPeriodDate: () => Date | null;
  getDaysUntilNextPeriod: () => number;
}

export const useCycleStore = create<CycleStore>()(
  persist(
    (set, get) => ({
      lastPeriodStart: null,
      cycleLength: 28,
      periodLength: 5,
      hasCompletedOnboarding: false,
      lifeStage: "regular" as LifeStage,
      groceryList: [],
      periodLogs: [],
      profileName: "",
      profileBirthYear: null,

      setLastPeriodStart: (date) => set({ lastPeriodStart: date.toISOString() }),
      setCycleLength: (days) => set({ cycleLength: days }),
      setPeriodLength: (days) => set({ periodLength: days }),
      setLifeStage: (stage) => set({ lifeStage: stage }),
      setProfile: (name, birthYear) => set({ profileName: name, profileBirthYear: birthYear }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false, lastPeriodStart: null, lifeStage: "regular", periodLogs: [], profileName: "", profileBirthYear: null }),

      logPeriodStart: (date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        set((state) => {
          // Check if there's already a log starting on this date
          const existing = state.periodLogs.find((l) => l.startDate === dateStr);
          if (existing) return state;
          return {
            periodLogs: [...state.periodLogs, { id: `${Date.now()}`, startDate: dateStr, endDate: null }],
            lastPeriodStart: date.toISOString(),
          };
        });
      },

      logPeriodEnd: (date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        set((state) => {
          // Find the most recent log without an end date
          const sorted = [...state.periodLogs].sort((a, b) => b.startDate.localeCompare(a.startDate));
          const openLog = sorted.find((l) => !l.endDate);
          if (!openLog) return state;
          // End date must be on or after start date
          if (dateStr < openLog.startDate) return state;
          const updatedLogs = state.periodLogs.map((l) =>
            l.id === openLog.id ? { ...l, endDate: dateStr } : l
          );
          // Also update periodLength based on this log
          const start = new Date(openLog.startDate + "T12:00:00");
          const end = new Date(dateStr + "T12:00:00");
          const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return { periodLogs: updatedLogs, periodLength: days };
        });
      },

      removePeriodLog: (id) =>
        set((state) => ({
          periodLogs: state.periodLogs.filter((l) => l.id !== id),
        })),

      getAverageCycleLength: () => {
        const { periodLogs, cycleLength } = get();
        const completed = [...periodLogs].filter((l) => l.endDate).sort((a, b) => a.startDate.localeCompare(b.startDate));
        if (completed.length < 2) return cycleLength;
        let totalDays = 0;
        let count = 0;
        for (let i = 1; i < completed.length; i++) {
          const prev = new Date(completed[i - 1].startDate + "T12:00:00");
          const curr = new Date(completed[i].startDate + "T12:00:00");
          const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
          if (diff > 0 && diff < 90) { // Ignore gaps > 90 days
            totalDays += diff;
            count++;
          }
        }
        return count > 0 ? Math.round(totalDays / count) : cycleLength;
      },

      getAveragePeriodLength: () => {
        const { periodLogs, periodLength } = get();
        const completed = periodLogs.filter((l) => l.endDate);
        if (completed.length === 0) return periodLength;
        const total = completed.reduce((sum, l) => {
          const start = new Date(l.startDate + "T12:00:00");
          const end = new Date(l.endDate! + "T12:00:00");
          return sum + Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }, 0);
        return Math.round(total / completed.length);
      },

      getPredictedOvulation: () => {
        const { lastPeriodStart } = get();
        if (!lastPeriodStart) return null;
        const avgCycle = get().getAverageCycleLength();
        const start = new Date(lastPeriodStart);
        const ovDay = avgCycle - 14;
        const ovDate = new Date(start);
        ovDate.setDate(ovDate.getDate() + ovDay);
        return ovDate;
      },

      getPredictedNextPeriod: () => {
        const { lastPeriodStart } = get();
        if (!lastPeriodStart) return null;
        const avgCycle = get().getAverageCycleLength();
        const start = new Date(lastPeriodStart);
        const nextDate = new Date(start);
        nextDate.setDate(nextDate.getDate() + avgCycle);
        return nextDate;
      },

      toggleGroceryItem: (id) =>
        set((state) => ({
          groceryList: state.groceryList.map((item) =>
            item.id === id ? { ...item, isChecked: !item.isChecked } : item
          ),
        })),

      clearGroceryList: () => set({ groceryList: [] }),

      addPhaseGroceries: (phase, items) =>
        set((state) => {
          const existingNames = new Set(state.groceryList.map((i) => i.name.toLowerCase()));
          const newItems = items
            .filter((item) => !existingNames.has(item.name.toLowerCase()))
            .map((item, index) => ({
              id: `${Date.now()}-${index}`,
              name: item.name,
              phase,
              category: item.category,
              isChecked: false,
            }));
          return { groceryList: [...state.groceryList, ...newItems] };
        }),

      getCurrentPhase: () => {
        const { lastPeriodStart, cycleLength, periodLength } = get();
        return getCurrentPhase(lastPeriodStart, cycleLength, periodLength);
      },

      getDayOfCycle: () => {
        const { lastPeriodStart, cycleLength } = get();
        return getDayOfCycle(lastPeriodStart, cycleLength);
      },

      getPhaseProgress: () => {
        const { lastPeriodStart, cycleLength, periodLength } = get();
        return getPhaseProgress(lastPeriodStart, cycleLength, periodLength);
      },

      getNextPeriodDate: () => {
        const { lastPeriodStart, cycleLength } = get();
        return getNextPeriodDate(lastPeriodStart, cycleLength);
      },

      getDaysUntilNextPeriod: () => {
        const { lastPeriodStart, cycleLength } = get();
        return getDaysUntilNextPeriod(lastPeriodStart, cycleLength);
      },
    }),
    {
      name: "luna-cycle-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
