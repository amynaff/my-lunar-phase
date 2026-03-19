import type { CyclePhase } from "./types";

export function getCurrentPhase(
  lastPeriodStart: string | null,
  cycleLength: number,
  periodLength: number
): CyclePhase {
  if (!lastPeriodStart) return "follicular";
  const start = new Date(lastPeriodStart);
  const today = new Date();
  const daysSinceStart = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dayOfCycle = (daysSinceStart % cycleLength) + 1;
  if (dayOfCycle <= periodLength) return "menstrual";
  if (dayOfCycle <= 13) return "follicular";
  if (dayOfCycle <= 17) return "ovulatory";
  return "luteal";
}

export function getDayOfCycle(
  lastPeriodStart: string | null,
  cycleLength: number
): number {
  if (!lastPeriodStart) return 1;
  const start = new Date(lastPeriodStart);
  const today = new Date();
  const daysSinceStart = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return (daysSinceStart % cycleLength) + 1;
}

export function getPhaseProgress(
  lastPeriodStart: string | null,
  cycleLength: number,
  periodLength: number
): number {
  if (!lastPeriodStart) return 0;
  const dayOfCycle = getDayOfCycle(lastPeriodStart, cycleLength);
  const phase = getCurrentPhase(lastPeriodStart, cycleLength, periodLength);
  switch (phase) {
    case "menstrual":
      return dayOfCycle / periodLength;
    case "follicular":
      return (dayOfCycle - periodLength) / (13 - periodLength);
    case "ovulatory":
      return (dayOfCycle - 13) / 4;
    case "luteal":
      return (dayOfCycle - 17) / (cycleLength - 17);
    default:
      return 0;
  }
}

export function getNextPeriodDate(
  lastPeriodStart: string | null,
  cycleLength: number
): Date | null {
  if (!lastPeriodStart) return null;
  const start = new Date(lastPeriodStart);
  const today = new Date();
  const daysSinceStart = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const currentCycleNumber = Math.floor(daysSinceStart / cycleLength);
  const nextPeriod = new Date(start);
  nextPeriod.setDate(nextPeriod.getDate() + (currentCycleNumber + 1) * cycleLength);
  return nextPeriod;
}

export function getDaysUntilNextPeriod(
  lastPeriodStart: string | null,
  cycleLength: number
): number {
  const nextPeriod = getNextPeriodDate(lastPeriodStart, cycleLength);
  if (!nextPeriod) return 0;
  const today = new Date();
  return Math.ceil(
    (nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}
