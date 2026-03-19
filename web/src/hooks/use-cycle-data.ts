"use client";

import { useMemo } from "react";
import { useCycleStore } from "@/stores/cycle-store";
import { getMoonPhase } from "@/lib/cycle/moon-phase";
import { phaseInfo, moonPhaseInfo, lifeStageInfo } from "@/lib/cycle/data";

export function useCycleData() {
  const store = useCycleStore();

  return useMemo(() => {
    const currentPhase = store.getCurrentPhase();
    const dayOfCycle = store.getDayOfCycle();
    const phaseProgress = store.getPhaseProgress();
    const daysUntilNextPeriod = store.getDaysUntilNextPeriod();
    const nextPeriodDate = store.getNextPeriodDate();
    const currentMoonPhase = getMoonPhase();

    const isRegular = store.lifeStage === "regular";
    const currentPhaseInfo = phaseInfo[currentPhase];
    const currentMoonInfo = moonPhaseInfo[currentMoonPhase];
    const currentLifeStageInfo = lifeStageInfo[store.lifeStage];

    return {
      lifeStage: store.lifeStage,
      currentPhase,
      dayOfCycle,
      phaseProgress,
      daysUntilNextPeriod,
      nextPeriodDate,
      currentMoonPhase,
      isRegular,
      currentPhaseInfo,
      currentMoonInfo,
      currentLifeStageInfo,
      hasCompletedOnboarding: store.hasCompletedOnboarding,
      cycleLength: store.cycleLength,
      periodLength: store.periodLength,
    };
  }, [store]);
}
