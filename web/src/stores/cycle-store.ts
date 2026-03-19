"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CyclePhase, LifeStage } from "@/lib/cycle/types";
import { getCurrentPhase, getDayOfCycle, getPhaseProgress, getNextPeriodDate, getDaysUntilNextPeriod } from "@/lib/cycle/phase-calculator";

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

  setLastPeriodStart: (date: Date) => void;
  setCycleLength: (days: number) => void;
  setPeriodLength: (days: number) => void;
  setLifeStage: (stage: LifeStage) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

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

      setLastPeriodStart: (date) => set({ lastPeriodStart: date.toISOString() }),
      setCycleLength: (days) => set({ cycleLength: days }),
      setPeriodLength: (days) => set({ periodLength: days }),
      setLifeStage: (stage) => set({ lifeStage: stage }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false, lastPeriodStart: null, lifeStage: "regular" }),

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
