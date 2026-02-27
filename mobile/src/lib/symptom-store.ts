import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CyclePhase } from './cycle-store';

// Symptom categories
export type SymptomCategory =
  | 'physical'
  | 'emotional'
  | 'energy'
  | 'digestive'
  | 'sleep'
  | 'skin'
  | 'other';

// Individual symptoms
export interface SymptomDefinition {
  id: string;
  name: string;
  icon: string;
  category: SymptomCategory;
}

// All available symptoms
export const availableSymptoms: SymptomDefinition[] = [
  // Physical
  { id: 'cramps', name: 'Cramps', icon: '😣', category: 'physical' },
  { id: 'headache', name: 'Headache', icon: '🤕', category: 'physical' },
  { id: 'backache', name: 'Back Pain', icon: '💢', category: 'physical' },
  { id: 'breast_tenderness', name: 'Breast Tenderness', icon: '🩹', category: 'physical' },
  { id: 'bloating', name: 'Bloating', icon: '🎈', category: 'physical' },
  { id: 'joint_pain', name: 'Joint Pain', icon: '🦴', category: 'physical' },
  { id: 'hot_flashes', name: 'Hot Flashes', icon: '🔥', category: 'physical' },
  { id: 'night_sweats', name: 'Night Sweats', icon: '💦', category: 'physical' },

  // Emotional
  { id: 'mood_swings', name: 'Mood Swings', icon: '🎭', category: 'emotional' },
  { id: 'irritability', name: 'Irritability', icon: '😤', category: 'emotional' },
  { id: 'anxiety', name: 'Anxiety', icon: '😰', category: 'emotional' },
  { id: 'sadness', name: 'Sadness', icon: '😢', category: 'emotional' },
  { id: 'sensitivity', name: 'Sensitivity', icon: '💔', category: 'emotional' },
  { id: 'happy', name: 'Happy', icon: '😊', category: 'emotional' },
  { id: 'confident', name: 'Confident', icon: '💪', category: 'emotional' },
  { id: 'brain_fog', name: 'Brain Fog', icon: '🌫️', category: 'emotional' },

  // Energy
  { id: 'fatigue', name: 'Fatigue', icon: '😴', category: 'energy' },
  { id: 'low_energy', name: 'Low Energy', icon: '🔋', category: 'energy' },
  { id: 'high_energy', name: 'High Energy', icon: '⚡', category: 'energy' },
  { id: 'restless', name: 'Restless', icon: '🏃', category: 'energy' },

  // Digestive
  { id: 'cravings', name: 'Cravings', icon: '🍫', category: 'digestive' },
  { id: 'increased_appetite', name: 'Increased Appetite', icon: '🍽️', category: 'digestive' },
  { id: 'decreased_appetite', name: 'Decreased Appetite', icon: '🥗', category: 'digestive' },
  { id: 'nausea', name: 'Nausea', icon: '🤢', category: 'digestive' },
  { id: 'digestive_issues', name: 'Digestive Issues', icon: '🫃', category: 'digestive' },

  // Sleep
  { id: 'insomnia', name: 'Insomnia', icon: '😵', category: 'sleep' },
  { id: 'oversleeping', name: 'Oversleeping', icon: '😪', category: 'sleep' },
  { id: 'vivid_dreams', name: 'Vivid Dreams', icon: '💭', category: 'sleep' },
  { id: 'difficulty_waking', name: 'Difficulty Waking', icon: '⏰', category: 'sleep' },

  // Skin
  { id: 'acne', name: 'Acne', icon: '😖', category: 'skin' },
  { id: 'dry_skin', name: 'Dry Skin', icon: '🏜️', category: 'skin' },
  { id: 'oily_skin', name: 'Oily Skin', icon: '✨', category: 'skin' },
  { id: 'glowing_skin', name: 'Glowing Skin', icon: '🌟', category: 'skin' },

  // Other
  { id: 'libido_high', name: 'High Libido', icon: '❤️‍🔥', category: 'other' },
  { id: 'libido_low', name: 'Low Libido', icon: '💤', category: 'other' },
  { id: 'water_retention', name: 'Water Retention', icon: '💧', category: 'other' },
  { id: 'dizziness', name: 'Dizziness', icon: '💫', category: 'other' },
];

// Symptom severity levels
export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

// Logged symptom entry
export interface SymptomLog {
  symptomId: string;
  severity: SymptomSeverity;
}

// Daily symptom entry
export interface DailySymptomEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  symptoms: SymptomLog[];
  cyclePhase: CyclePhase | null;
  cycleDay: number | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Pattern insight
export interface SymptomPattern {
  symptomId: string;
  phase: CyclePhase;
  occurrenceCount: number;
  totalDaysInPhase: number;
  averageSeverity: number; // 1 = mild, 2 = moderate, 3 = severe
}

interface SymptomStore {
  entries: DailySymptomEntry[];

  // Actions
  logSymptoms: (date: string, symptoms: SymptomLog[], cyclePhase: CyclePhase | null, cycleDay: number | null, notes?: string) => void;
  updateEntry: (id: string, symptoms: SymptomLog[], notes?: string) => void;
  deleteEntry: (id: string) => void;
  getEntryByDate: (date: string) => DailySymptomEntry | undefined;
  getEntriesForPhase: (phase: CyclePhase) => DailySymptomEntry[];
  getSymptomPatterns: () => SymptomPattern[];
  getPredictedSymptoms: (phase: CyclePhase) => { symptomId: string; likelihood: number; averageSeverity: number }[];
  getRecentEntries: (days: number) => DailySymptomEntry[];
  getMostCommonSymptoms: (limit?: number) => { symptomId: string; count: number }[];
}

export const useSymptomStore = create<SymptomStore>()(
  persist(
    (set, get) => ({
      entries: [],

      logSymptoms: (date, symptoms, cyclePhase, cycleDay, notes) => {
        const existingEntry = get().entries.find(e => e.date === date);

        if (existingEntry) {
          // Update existing entry
          set((state) => ({
            entries: state.entries.map(e =>
              e.date === date
                ? { ...e, symptoms, cyclePhase, cycleDay, notes, updatedAt: new Date().toISOString() }
                : e
            ),
          }));
        } else {
          // Create new entry
          const newEntry: DailySymptomEntry = {
            id: `symptom-${Date.now()}`,
            date,
            symptoms,
            cyclePhase,
            cycleDay,
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            entries: [...state.entries, newEntry].sort((a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          }));
        }
      },

      updateEntry: (id, symptoms, notes) => {
        set((state) => ({
          entries: state.entries.map(e =>
            e.id === id
              ? { ...e, symptoms, notes, updatedAt: new Date().toISOString() }
              : e
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter(e => e.id !== id),
        }));
      },

      getEntryByDate: (date) => {
        return get().entries.find(e => e.date === date);
      },

      getEntriesForPhase: (phase) => {
        return get().entries.filter(e => e.cyclePhase === phase);
      },

      getSymptomPatterns: () => {
        const entries = get().entries;
        const patterns: Map<string, SymptomPattern> = new Map();
        const phaseDayCounts: Map<CyclePhase, number> = new Map();

        // Count days per phase
        entries.forEach(entry => {
          if (entry.cyclePhase) {
            phaseDayCounts.set(
              entry.cyclePhase,
              (phaseDayCounts.get(entry.cyclePhase) || 0) + 1
            );
          }
        });

        // Calculate patterns
        entries.forEach(entry => {
          if (!entry.cyclePhase) return;

          entry.symptoms.forEach(symptom => {
            const key = `${symptom.symptomId}-${entry.cyclePhase}`;
            const severityValue = symptom.severity === 'mild' ? 1 : symptom.severity === 'moderate' ? 2 : 3;

            if (patterns.has(key)) {
              const existing = patterns.get(key)!;
              existing.occurrenceCount++;
              existing.averageSeverity = (existing.averageSeverity * (existing.occurrenceCount - 1) + severityValue) / existing.occurrenceCount;
            } else {
              patterns.set(key, {
                symptomId: symptom.symptomId,
                phase: entry.cyclePhase!,
                occurrenceCount: 1,
                totalDaysInPhase: phaseDayCounts.get(entry.cyclePhase!) || 1,
                averageSeverity: severityValue,
              });
            }
          });
        });

        // Update total days in phase
        patterns.forEach(pattern => {
          pattern.totalDaysInPhase = phaseDayCounts.get(pattern.phase) || 1;
        });

        return Array.from(patterns.values()).sort((a, b) =>
          (b.occurrenceCount / b.totalDaysInPhase) - (a.occurrenceCount / a.totalDaysInPhase)
        );
      },

      getPredictedSymptoms: (phase) => {
        const patterns = get().getSymptomPatterns();
        const phasePatterns = patterns.filter(p => p.phase === phase);

        return phasePatterns
          .map(p => ({
            symptomId: p.symptomId,
            likelihood: Math.min((p.occurrenceCount / p.totalDaysInPhase) * 100, 100),
            averageSeverity: p.averageSeverity,
          }))
          .filter(p => p.likelihood >= 30) // Only show symptoms that occur 30%+ of the time
          .sort((a, b) => b.likelihood - a.likelihood);
      },

      getRecentEntries: (days) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return get().entries.filter(e =>
          new Date(e.date) >= cutoffDate
        );
      },

      getMostCommonSymptoms: (limit = 5) => {
        const entries = get().entries;
        const symptomCounts: Map<string, number> = new Map();

        entries.forEach(entry => {
          entry.symptoms.forEach(symptom => {
            symptomCounts.set(
              symptom.symptomId,
              (symptomCounts.get(symptom.symptomId) || 0) + 1
            );
          });
        });

        return Array.from(symptomCounts.entries())
          .map(([symptomId, count]) => ({ symptomId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      },
    }),
    {
      name: 'symptom-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to get symptom definition by ID
export const getSymptomById = (id: string): SymptomDefinition | undefined => {
  return availableSymptoms.find(s => s.id === id);
};

// Get symptoms by category
export const getSymptomsByCategory = (category: SymptomCategory): SymptomDefinition[] => {
  return availableSymptoms.filter(s => s.category === category);
};

// Category display names
export const categoryNames: Record<SymptomCategory, string> = {
  physical: 'Physical',
  emotional: 'Emotional',
  energy: 'Energy',
  digestive: 'Digestive',
  sleep: 'Sleep',
  skin: 'Skin',
  other: 'Other',
};

// Severity display config
export const severityConfig: Record<SymptomSeverity, { label: string; color: string; value: number }> = {
  mild: { label: 'Mild', color: '#10b981', value: 1 },
  moderate: { label: 'Moderate', color: '#f59e0b', value: 2 },
  severe: { label: 'Severe', color: '#ef4444', value: 3 },
};
