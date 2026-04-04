import type { CyclePhase, LifeStage } from "./types";

/**
 * Symptoms that are most commonly reported during each cycle phase.
 * Used to surface "suggested" symptoms in the daily check-in,
 * reducing friction by showing the most relevant ones first.
 */
export const phaseSymptomSuggestions: Record<CyclePhase, string[]> = {
  menstrual: [
    "cramps",
    "fatigue",
    "low_energy",
    "backache",
    "bloating",
    "headache",
    "sadness",
    "mood_swings",
    "cravings",
    "insomnia",
  ],
  follicular: [
    "high_energy",
    "happy",
    "confident",
    "glowing_skin",
    "increased_appetite",
    "restless",
    "acne",
    "breast_tenderness",
  ],
  ovulatory: [
    "high_energy",
    "happy",
    "confident",
    "libido_high",
    "bloating",
    "breast_tenderness",
    "sensitivity",
    "glowing_skin",
  ],
  luteal: [
    "mood_swings",
    "irritability",
    "bloating",
    "cravings",
    "breast_tenderness",
    "fatigue",
    "anxiety",
    "acne",
    "insomnia",
    "brain_fog",
    "headache",
    "water_retention",
  ],
};

/**
 * Life-stage-specific symptom suggestions.
 * These supplement (or replace) phase-based suggestions
 * for users in perimenopause, menopause, or postmenopause.
 */
export const lifeStageSymptomSuggestions: Partial<Record<LifeStage, string[]>> = {
  perimenopause: [
    "hot_flashes",
    "night_sweats",
    "mood_swings",
    "anxiety",
    "insomnia",
    "brain_fog",
    "fatigue",
    "joint_pain",
    "irritability",
    "bloating",
    "headache",
    "low_energy",
    "libido_low",
    "dry_skin",
    "dizziness",
    "water_retention",
  ],
  menopause: [
    "hot_flashes",
    "night_sweats",
    "insomnia",
    "brain_fog",
    "joint_pain",
    "fatigue",
    "mood_swings",
    "anxiety",
    "dry_skin",
    "libido_low",
    "dizziness",
    "irritability",
    "low_energy",
    "water_retention",
  ],
  postmenopause: [
    "joint_pain",
    "dry_skin",
    "fatigue",
    "brain_fog",
    "low_energy",
    "insomnia",
    "anxiety",
    "hot_flashes",
    "dizziness",
    "libido_low",
    "mood_swings",
  ],
};

/**
 * Get suggested symptom IDs for a given life stage and optional cycle phase.
 * For regular users: uses cycle phase suggestions.
 * For peri/meno/post: uses life stage suggestions.
 */
export function getSuggestedSymptoms(
  lifeStage: LifeStage,
  cyclePhase?: CyclePhase
): string[] {
  if (lifeStage !== "regular") {
    return lifeStageSymptomSuggestions[lifeStage] || [];
  }
  if (cyclePhase) {
    return phaseSymptomSuggestions[cyclePhase] || [];
  }
  return [];
}

/**
 * Get a human-readable label for the suggestion context.
 */
export function getSuggestionLabel(
  lifeStage: LifeStage,
  cyclePhase?: CyclePhase
): string {
  if (lifeStage === "perimenopause") return "Common in perimenopause";
  if (lifeStage === "menopause") return "Common in menopause";
  if (lifeStage === "postmenopause") return "Common in postmenopause";
  if (cyclePhase) {
    const labels: Record<CyclePhase, string> = {
      menstrual: "Common during your period",
      follicular: "Common in follicular phase",
      ovulatory: "Common during ovulation",
      luteal: "Common in luteal phase",
    };
    return labels[cyclePhase];
  }
  return "Suggested for you";
}
