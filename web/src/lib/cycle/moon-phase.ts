import type { MoonPhase } from "./types";

const KNOWN_NEW_MOON = new Date(2000, 0, 6, 18, 14, 0);
const LUNAR_CYCLE = 29.53058867;

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const daysSinceNewMoon =
    (date.getTime() - KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = ((daysSinceNewMoon % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;

  if (moonAge < 1.85) return "new_moon";
  if (moonAge < 7.38) return "waxing_crescent";
  if (moonAge < 9.23) return "first_quarter";
  if (moonAge < 14.77) return "waxing_gibbous";
  if (moonAge < 16.61) return "full_moon";
  if (moonAge < 22.15) return "waning_gibbous";
  if (moonAge < 23.99) return "last_quarter";
  return "waning_crescent";
}

export function getMoonPhaseCycleEquivalent(moonPhase: MoonPhase) {
  const mapping: Record<MoonPhase, string> = {
    new_moon: "menstrual",
    waxing_crescent: "follicular",
    first_quarter: "follicular",
    waxing_gibbous: "ovulatory",
    full_moon: "ovulatory",
    waning_gibbous: "luteal",
    last_quarter: "luteal",
    waning_crescent: "menstrual",
  };
  return mapping[moonPhase];
}
