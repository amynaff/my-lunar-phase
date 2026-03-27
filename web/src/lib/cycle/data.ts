import type { CyclePhase, LifeStage, MoonPhase, PhaseInfo, MoonPhaseInfo, LifeStageInfo, SymptomDef } from "./types";

export const phaseInfo: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    name: "Menstrual",
    emoji: "\u{1F311}",
    color: "#be185d",
    description: "Inner Winter - A time for rest, reflection, and gentle self-care.",
    energy: "Low & Inward",
    superpower: "Deep intuition & self-awareness",
  },
  follicular: {
    name: "Follicular",
    emoji: "\u{1F312}",
    color: "#ec4899",
    description: "Inner Spring - Fresh energy emerges. Perfect for new beginnings.",
    energy: "Rising & Creative",
    superpower: "New ideas & fresh perspectives",
  },
  ovulatory: {
    name: "Ovulatory",
    emoji: "\u{1F315}",
    color: "#f9a8d4",
    description: "Inner Summer - Peak energy and social magnetism.",
    energy: "High & Outward",
    superpower: "Communication & connection",
  },
  luteal: {
    name: "Luteal",
    emoji: "\u{1F316}",
    color: "#9333ea",
    description: "Inner Autumn - Time to complete tasks and turn inward.",
    energy: "Winding Down",
    superpower: "Focus & attention to detail",
  },
};

export const moonPhaseInfo: Record<MoonPhase, MoonPhaseInfo> = {
  new_moon: {
    name: "New Moon",
    emoji: "\u{1F311}",
    color: "#1e1b4b",
    description: "A time for rest, reflection, and setting intentions.",
    energy: "Inward & Restorative",
    correspondingCyclePhase: "menstrual",
  },
  waxing_crescent: {
    name: "Waxing Crescent",
    emoji: "\u{1F312}",
    color: "#4c1d95",
    description: "Fresh energy emerges. Plant seeds for new beginnings.",
    energy: "Rising & Hopeful",
    correspondingCyclePhase: "follicular",
  },
  first_quarter: {
    name: "First Quarter",
    emoji: "\u{1F313}",
    color: "#6d28d9",
    description: "Take action on your intentions. Build momentum.",
    energy: "Active & Determined",
    correspondingCyclePhase: "follicular",
  },
  waxing_gibbous: {
    name: "Waxing Gibbous",
    emoji: "\u{1F314}",
    color: "#7c3aed",
    description: "Refine and adjust. Trust the process.",
    energy: "Building & Refining",
    correspondingCyclePhase: "ovulatory",
  },
  full_moon: {
    name: "Full Moon",
    emoji: "\u{1F315}",
    color: "#f5f3ff",
    description: "Peak energy and illumination. Celebrate your progress.",
    energy: "High & Radiant",
    correspondingCyclePhase: "ovulatory",
  },
  waning_gibbous: {
    name: "Waning Gibbous",
    emoji: "\u{1F316}",
    color: "#8b5cf6",
    description: "Share your wisdom. Practice gratitude.",
    energy: "Generous & Grateful",
    correspondingCyclePhase: "luteal",
  },
  last_quarter: {
    name: "Last Quarter",
    emoji: "\u{1F317}",
    color: "#a78bfa",
    description: "Release what no longer serves you. Forgive and let go.",
    energy: "Releasing & Clearing",
    correspondingCyclePhase: "luteal",
  },
  waning_crescent: {
    name: "Waning Crescent",
    emoji: "\u{1F318}",
    color: "#c4b5fd",
    description: "Rest and surrender. Prepare for renewal.",
    energy: "Restful & Surrendering",
    correspondingCyclePhase: "menstrual",
  },
};

// Moon energy labels for menopause/postmenopause users
// Maps cycle phase equivalents to moon-based energy descriptions
export const moonEnergyLabels: Record<CyclePhase, { name: string; description: string }> = {
  menstrual: { name: "Rest & Reflect", description: "New Moon energy — turn inward, set intentions" },
  follicular: { name: "Rise & Create", description: "Waxing Moon energy — fresh starts, new ideas" },
  ovulatory: { name: "Shine & Connect", description: "Full Moon energy — peak radiance, celebrate" },
  luteal: { name: "Release & Restore", description: "Waning Moon energy — let go, wind down" },
};

export const lifeStageInfo: Record<LifeStage, LifeStageInfo> = {
  regular: {
    name: "Regular Cycles",
    emoji: "\u{1F319}",
    color: "#9d84ed",
    description: "Your monthly rhythm guides your wellness journey.",
    ageRange: "Reproductive years",
  },
  perimenopause: {
    name: "Perimenopause",
    emoji: "\u{1F317}",
    color: "#f59e0b",
    description: "A powerful transition. Your body is preparing for a new chapter.",
    ageRange: "Usually 40s-50s",
  },
  menopause: {
    name: "Menopause",
    emoji: "\u{2728}",
    color: "#8b5cf6",
    description: "A time of wisdom and freedom. Embrace your second spring.",
    ageRange: "12+ months without period",
  },
  postmenopause: {
    name: "Post Menopause",
    emoji: "\u{1F31F}",
    color: "#ec4899",
    description: "Your wisdom years. A time of renewal, clarity, and vibrant living.",
    ageRange: "After menopause transition",
  },
};

export const perimenopauseSymptoms: SymptomDef[] = [
  { id: "hot_flashes", name: "Hot Flashes", emoji: "\u{1F525}", category: "vasomotor" },
  { id: "night_sweats", name: "Night Sweats", emoji: "\u{1F4A7}", category: "vasomotor" },
  { id: "irregular_periods", name: "Irregular Periods", emoji: "\u{1F4C5}", category: "menstrual" },
  { id: "heavy_bleeding", name: "Heavy Bleeding", emoji: "\u{1FA78}", category: "menstrual" },
  { id: "mood_swings", name: "Mood Swings", emoji: "\u{1F3AD}", category: "mood" },
  { id: "anxiety", name: "Anxiety", emoji: "\u{1F630}", category: "mood" },
  { id: "brain_fog", name: "Brain Fog", emoji: "\u{1F32B}\u{FE0F}", category: "cognitive" },
  { id: "sleep_issues", name: "Sleep Issues", emoji: "\u{1F634}", category: "sleep" },
  { id: "fatigue", name: "Fatigue", emoji: "\u{1F50B}", category: "energy" },
  { id: "joint_pain", name: "Joint Pain", emoji: "\u{1F9B4}", category: "physical" },
  { id: "weight_changes", name: "Weight Changes", emoji: "\u{2696}\u{FE0F}", category: "physical" },
  { id: "low_libido", name: "Low Libido", emoji: "\u{1F49C}", category: "intimate" },
  { id: "vaginal_dryness", name: "Vaginal Dryness", emoji: "\u{1F335}", category: "intimate" },
  { id: "headaches", name: "Headaches", emoji: "\u{1F915}", category: "physical" },
  { id: "heart_palpitations", name: "Heart Palpitations", emoji: "\u{1F493}", category: "vasomotor" },
];

export const menopauseSymptoms: SymptomDef[] = [
  { id: "hot_flashes", name: "Hot Flashes", emoji: "\u{1F525}", category: "vasomotor" },
  { id: "night_sweats", name: "Night Sweats", emoji: "\u{1F4A7}", category: "vasomotor" },
  { id: "mood_changes", name: "Mood Changes", emoji: "\u{1F3AD}", category: "mood" },
  { id: "anxiety", name: "Anxiety", emoji: "\u{1F630}", category: "mood" },
  { id: "depression", name: "Low Mood", emoji: "\u{1F614}", category: "mood" },
  { id: "brain_fog", name: "Brain Fog", emoji: "\u{1F32B}\u{FE0F}", category: "cognitive" },
  { id: "memory_issues", name: "Memory Issues", emoji: "\u{1F9E0}", category: "cognitive" },
  { id: "sleep_issues", name: "Sleep Issues", emoji: "\u{1F634}", category: "sleep" },
  { id: "fatigue", name: "Fatigue", emoji: "\u{1F50B}", category: "energy" },
  { id: "joint_pain", name: "Joint Pain", emoji: "\u{1F9B4}", category: "physical" },
  { id: "bone_health", name: "Bone Health Concerns", emoji: "\u{1F4AA}", category: "physical" },
  { id: "weight_changes", name: "Weight Changes", emoji: "\u{2696}\u{FE0F}", category: "physical" },
  { id: "low_libido", name: "Low Libido", emoji: "\u{1F49C}", category: "intimate" },
  { id: "vaginal_dryness", name: "Vaginal Dryness", emoji: "\u{1F335}", category: "intimate" },
  { id: "urinary_issues", name: "Urinary Changes", emoji: "\u{1F6BF}", category: "physical" },
  { id: "skin_changes", name: "Skin Changes", emoji: "\u{2728}", category: "physical" },
  { id: "hair_changes", name: "Hair Changes", emoji: "\u{1F487}", category: "physical" },
];

export const postmenopauseSymptoms: SymptomDef[] = [
  { id: "bone_health", name: "Bone Health", emoji: "\u{1F9B4}", category: "physical" },
  { id: "heart_health", name: "Heart Health", emoji: "\u{2764}\u{FE0F}", category: "physical" },
  { id: "joint_stiffness", name: "Joint Stiffness", emoji: "\u{1F9B5}", category: "physical" },
  { id: "sleep_quality", name: "Sleep Quality", emoji: "\u{1F634}", category: "sleep" },
  { id: "energy_levels", name: "Energy Levels", emoji: "\u{26A1}", category: "energy" },
  { id: "mood_wellness", name: "Mood & Wellness", emoji: "\u{1F308}", category: "mood" },
  { id: "cognitive_clarity", name: "Mental Clarity", emoji: "\u{1F9E0}", category: "cognitive" },
  { id: "vaginal_health", name: "Vaginal Health", emoji: "\u{1F338}", category: "intimate" },
  { id: "urinary_health", name: "Urinary Health", emoji: "\u{1F4A7}", category: "physical" },
  { id: "skin_elasticity", name: "Skin Health", emoji: "\u{2728}", category: "physical" },
  { id: "weight_management", name: "Weight Management", emoji: "\u{2696}\u{FE0F}", category: "physical" },
  { id: "stress_levels", name: "Stress Levels", emoji: "\u{1F9D8}", category: "mood" },
  { id: "social_connection", name: "Social Connection", emoji: "\u{1F465}", category: "mood" },
  { id: "libido", name: "Intimacy & Libido", emoji: "\u{1F49C}", category: "intimate" },
];
