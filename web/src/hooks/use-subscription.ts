"use client";

import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSession } from "./use-session";
import { useEffect } from "react";

export function useSubscription() {
  const store = useSubscriptionStore();
  const { user } = useSession();

  useEffect(() => {
    if (user && "subscriptionPlan" in user) {
      const plan = (user as { subscriptionPlan?: string }).subscriptionPlan;
      if (plan === "monthly" || plan === "annual" || plan === "trial") {
        store.setPlan(plan);
      } else {
        store.setPlan("free");
      }
    }
  }, [user, store]);

  return {
    plan: store.plan,
    isPremium: store.isPremium(),
    canAccessSymptomTracking: store.canAccessSymptomTracking(),
    canAccessDetailedInsights: store.canAccessDetailedInsights(),
    canAccessExport: store.canAccessExport(),
  };
}
