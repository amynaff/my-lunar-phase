export type CyclePhase = "menstrual" | "follicular" | "ovulatory" | "luteal";
export type LifeStage = "regular" | "perimenopause" | "menopause" | "postmenopause";
export type MoonPhase =
  | "new_moon"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full_moon"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";
export type SubscriptionPlan = "free" | "monthly" | "annual";

export interface MoodEntryData {
  date: string;
  mood: number;
  energy: number;
  notes?: string;
  cyclePhase?: string;
  dayOfCycle?: number;
}
