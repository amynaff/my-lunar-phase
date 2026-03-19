import { describe, it, expect } from "vitest";
import {
  getCurrentPhase,
  getDayOfCycle,
  getPhaseProgress,
  getNextPeriodDate,
  getDaysUntilNextPeriod,
} from "@/lib/cycle/phase-calculator";

describe("getCurrentPhase", () => {
  it("returns follicular when no last period start", () => {
    expect(getCurrentPhase(null, 28, 5)).toBe("follicular");
  });

  it("returns menstrual for day 1-5", () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 2); // 3rd day of cycle
    expect(getCurrentPhase(start.toISOString(), 28, 5)).toBe("menstrual");
  });

  it("returns follicular for days 6-13", () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 8); // 9th day of cycle
    expect(getCurrentPhase(start.toISOString(), 28, 5)).toBe("follicular");
  });

  it("returns ovulatory for days 14-17", () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 14); // 15th day
    expect(getCurrentPhase(start.toISOString(), 28, 5)).toBe("ovulatory");
  });

  it("returns luteal for days 18-28", () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 20); // 21st day
    expect(getCurrentPhase(start.toISOString(), 28, 5)).toBe("luteal");
  });

  it("wraps around cycle length", () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 30); // past 28-day cycle, day 3 of next
    expect(getCurrentPhase(start.toISOString(), 28, 5)).toBe("menstrual");
  });
});

describe("getDayOfCycle", () => {
  it("returns 1 when no last period start", () => {
    expect(getDayOfCycle(null, 28)).toBe(1);
  });

  it("returns correct day", () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 9); // 10th day
    expect(getDayOfCycle(start.toISOString(), 28)).toBe(10);
  });
});

describe("getPhaseProgress", () => {
  it("returns 0 when no last period start", () => {
    expect(getPhaseProgress(null, 28, 5)).toBe(0);
  });

  it("returns progress within phase", () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 2); // day 3 of menstrual (5-day period)
    const progress = getPhaseProgress(start.toISOString(), 28, 5);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(1);
  });
});

describe("getNextPeriodDate", () => {
  it("returns null when no last period start", () => {
    expect(getNextPeriodDate(null, 28)).toBeNull();
  });

  it("returns a future date", () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 10);
    const next = getNextPeriodDate(start.toISOString(), 28);
    expect(next).not.toBeNull();
    expect(next!.getTime()).toBeGreaterThan(today.getTime());
  });
});

describe("getDaysUntilNextPeriod", () => {
  it("returns 0 when no last period start", () => {
    expect(getDaysUntilNextPeriod(null, 28)).toBe(0);
  });

  it("returns positive number", () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 10);
    const days = getDaysUntilNextPeriod(start.toISOString(), 28);
    expect(days).toBeGreaterThan(0);
  });
});
