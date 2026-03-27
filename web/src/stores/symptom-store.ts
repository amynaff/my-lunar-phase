"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CyclePhase } from "@/lib/cycle/types";

export type SymptomCategory = "physical" | "emotional" | "energy" | "digestive" | "sleep" | "skin" | "other";
export type SymptomSeverity = "mild" | "moderate" | "severe";

export interface SymptomDefinition {
  id: string;
  name: string;
  icon: string;
  category: SymptomCategory;
}

export interface SymptomLog {
  symptomId: string;
  severity: SymptomSeverity;
}

export interface DailySymptomEntry {
  id: string;
  date: string;
  symptoms: SymptomLog[];
  cyclePhase: CyclePhase | null;
  cycleDay: number | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const availableSymptoms: SymptomDefinition[] = [
  // Physical
  { id: "cramps", name: "Cramps", icon: "😣", category: "physical" },
  { id: "headache", name: "Headache", icon: "🤕", category: "physical" },
  { id: "backache", name: "Back Pain", icon: "💢", category: "physical" },
  { id: "breast_tenderness", name: "Breast Tenderness", icon: "🩹", category: "physical" },
  { id: "bloating", name: "Bloating", icon: "🎈", category: "physical" },
  { id: "joint_pain", name: "Joint Pain", icon: "🦴", category: "physical" },
  { id: "hot_flashes", name: "Hot Flashes", icon: "🔥", category: "physical" },
  { id: "night_sweats", name: "Night Sweats", icon: "💦", category: "physical" },
  // Emotional
  { id: "mood_swings", name: "Mood Swings", icon: "🎭", category: "emotional" },
  { id: "irritability", name: "Irritability", icon: "😤", category: "emotional" },
  { id: "anxiety", name: "Anxiety", icon: "😰", category: "emotional" },
  { id: "sadness", name: "Sadness", icon: "😢", category: "emotional" },
  { id: "sensitivity", name: "Sensitivity", icon: "💔", category: "emotional" },
  { id: "happy", name: "Happy", icon: "😊", category: "emotional" },
  { id: "confident", name: "Confident", icon: "💪", category: "emotional" },
  { id: "brain_fog", name: "Brain Fog", icon: "🌫️", category: "emotional" },
  // Energy
  { id: "fatigue", name: "Fatigue", icon: "😴", category: "energy" },
  { id: "low_energy", name: "Low Energy", icon: "🔋", category: "energy" },
  { id: "high_energy", name: "High Energy", icon: "⚡", category: "energy" },
  { id: "restless", name: "Restless", icon: "🏃", category: "energy" },
  // Digestive
  { id: "cravings", name: "Cravings", icon: "🍫", category: "digestive" },
  { id: "increased_appetite", name: "Increased Appetite", icon: "🍽️", category: "digestive" },
  { id: "decreased_appetite", name: "Decreased Appetite", icon: "🥗", category: "digestive" },
  { id: "nausea", name: "Nausea", icon: "🤢", category: "digestive" },
  { id: "digestive_issues", name: "Digestive Issues", icon: "🫃", category: "digestive" },
  // Sleep
  { id: "insomnia", name: "Insomnia", icon: "😵", category: "sleep" },
  { id: "oversleeping", name: "Oversleeping", icon: "😪", category: "sleep" },
  { id: "vivid_dreams", name: "Vivid Dreams", icon: "💭", category: "sleep" },
  { id: "difficulty_waking", name: "Difficulty Waking", icon: "⏰", category: "sleep" },
  // Skin
  { id: "acne", name: "Acne", icon: "😖", category: "skin" },
  { id: "dry_skin", name: "Dry Skin", icon: "🏜️", category: "skin" },
  { id: "oily_skin", name: "Oily Skin", icon: "✨", category: "skin" },
  { id: "glowing_skin", name: "Glowing Skin", icon: "🌟", category: "skin" },
  // Other
  { id: "libido_high", name: "High Libido", icon: "❤️‍🔥", category: "other" },
  { id: "libido_low", name: "Low Libido", icon: "💤", category: "other" },
  { id: "water_retention", name: "Water Retention", icon: "💧", category: "other" },
  { id: "dizziness", name: "Dizziness", icon: "💫", category: "other" },
];

export const categoryNames: Record<SymptomCategory, string> = {
  physical: "Physical",
  emotional: "Emotional",
  energy: "Energy",
  digestive: "Digestive",
  sleep: "Sleep",
  skin: "Skin",
  other: "Other",
};

export const severityConfig: Record<SymptomSeverity, { label: string; color: string }> = {
  mild: { label: "Mild", color: "#22c55e" },
  moderate: { label: "Moderate", color: "#f59e0b" },
  severe: { label: "Severe", color: "#ef4444" },
};

export function getSymptomsByCategory(category: SymptomCategory): SymptomDefinition[] {
  return availableSymptoms.filter((s) => s.category === category);
}

export function getSymptomById(id: string): SymptomDefinition | undefined {
  return availableSymptoms.find((s) => s.id === id);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

interface SymptomStore {
  entries: DailySymptomEntry[];

  logSymptoms: (date: string, symptoms: SymptomLog[], cyclePhase: CyclePhase | null, cycleDay: number | null, notes?: string) => void;
  deleteEntry: (id: string) => void;
  getEntryByDate: (date: string) => DailySymptomEntry | undefined;
  getRecentEntries: (days: number) => DailySymptomEntry[];
  getMostCommonSymptoms: (limit?: number) => Array<{ symptomId: string; count: number }>;
}

export const useSymptomStore = create<SymptomStore>()(
  persist(
    (set, get) => ({
      entries: [],

      logSymptoms: (date, symptoms, cyclePhase, cycleDay, notes) => {
        const existing = get().entries.find((e) => e.date === date);
        if (existing) {
          set((state) => ({
            entries: state.entries.map((e) =>
              e.id === existing.id
                ? { ...e, symptoms, cyclePhase, cycleDay, notes, updatedAt: new Date().toISOString() }
                : e
            ),
          }));
        } else {
          const now = new Date().toISOString();
          set((state) => ({
            entries: [
              { id: generateId(), date, symptoms, cyclePhase, cycleDay, notes, createdAt: now, updatedAt: now },
              ...state.entries,
            ],
          }));
        }
      },

      deleteEntry: (id) => {
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
      },

      getEntryByDate: (date) => get().entries.find((e) => e.date === date),

      getRecentEntries: (days) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return get().entries.filter((e) => new Date(e.date) >= cutoff);
      },

      getMostCommonSymptoms: (limit = 5) => {
        const counts: Record<string, number> = {};
        for (const entry of get().entries) {
          for (const s of entry.symptoms) {
            counts[s.symptomId] = (counts[s.symptomId] || 0) + 1;
          }
        }
        return Object.entries(counts)
          .map(([symptomId, count]) => ({ symptomId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      },
    }),
    {
      name: "luna-symptom-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
