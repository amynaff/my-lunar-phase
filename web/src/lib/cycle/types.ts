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

export interface PhaseInfo {
  name: string;
  emoji: string;
  color: string;
  description: string;
  energy: string;
  superpower: string;
}

export interface MoonPhaseInfo {
  name: string;
  emoji: string;
  color: string;
  description: string;
  energy: string;
  correspondingCyclePhase: CyclePhase;
}

export interface LifeStageInfo {
  name: string;
  emoji: string;
  color: string;
  description: string;
  ageRange: string;
}

export interface SymptomDef {
  id: string;
  name: string;
  emoji: string;
  category: string;
}
