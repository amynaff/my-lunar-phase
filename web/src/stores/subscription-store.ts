"use client";

import { create } from "zustand";

type SubscriptionPlan = "free" | "monthly" | "annual";

interface SubscriptionStore {
  plan: SubscriptionPlan;
  setPlan: (plan: SubscriptionPlan) => void;
  isPremium: () => boolean;
  canAccessSymptomTracking: () => boolean;
  canAccessDetailedInsights: () => boolean;
  canAccessExport: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionStore>()((set, get) => ({
  plan: "free",
  setPlan: (plan) => set({ plan }),
  isPremium: () => get().plan !== "free",
  canAccessSymptomTracking: () => get().plan !== "free",
  canAccessDetailedInsights: () => get().plan !== "free",
  canAccessExport: () => get().plan !== "free",
}));
