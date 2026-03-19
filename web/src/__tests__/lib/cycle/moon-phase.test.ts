import { describe, it, expect } from "vitest";
import { getMoonPhase, getMoonPhaseCycleEquivalent } from "@/lib/cycle/moon-phase";

describe("getMoonPhase", () => {
  it("returns a valid moon phase", () => {
    const validPhases = [
      "new_moon",
      "waxing_crescent",
      "first_quarter",
      "waxing_gibbous",
      "full_moon",
      "waning_gibbous",
      "last_quarter",
      "waning_crescent",
    ];
    const phase = getMoonPhase(new Date());
    expect(validPhases).toContain(phase);
  });

  it("returns new_moon for known new moon date", () => {
    // January 6, 2000 was a known new moon
    const newMoonDate = new Date(2000, 0, 6, 18, 14, 0);
    expect(getMoonPhase(newMoonDate)).toBe("new_moon");
  });

  it("returns full_moon approximately 14.76 days after new moon", () => {
    const newMoon = new Date(2000, 0, 6, 18, 14, 0);
    const fullMoon = new Date(newMoon.getTime() + 14.76 * 24 * 60 * 60 * 1000);
    expect(getMoonPhase(fullMoon)).toBe("full_moon");
  });

  it("returns different phases for different dates", () => {
    const date1 = new Date(2024, 0, 1);
    const date2 = new Date(2024, 0, 8);
    const date3 = new Date(2024, 0, 15);
    // These should generally be different phases
    const phases = [getMoonPhase(date1), getMoonPhase(date2), getMoonPhase(date3)];
    // At least 2 should be different
    const unique = new Set(phases);
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });

  it("handles negative moon age (wrapping)", () => {
    // Very old date
    const oldDate = new Date(1990, 0, 1);
    const phase = getMoonPhase(oldDate);
    expect(phase).toBeTruthy();
  });
});

describe("getMoonPhaseCycleEquivalent", () => {
  it("maps new_moon to menstrual", () => {
    expect(getMoonPhaseCycleEquivalent("new_moon")).toBe("menstrual");
  });

  it("maps full_moon to ovulatory", () => {
    expect(getMoonPhaseCycleEquivalent("full_moon")).toBe("ovulatory");
  });

  it("maps waning_gibbous to luteal", () => {
    expect(getMoonPhaseCycleEquivalent("waning_gibbous")).toBe("luteal");
  });

  it("maps waxing_crescent to follicular", () => {
    expect(getMoonPhaseCycleEquivalent("waxing_crescent")).toBe("follicular");
  });
});
