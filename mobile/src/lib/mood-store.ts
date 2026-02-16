import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LocalMoodEntry {
  date: string; // ISO date string (YYYY-MM-DD)
  mood: number; // 1-5
  energy: number; // 1-5
  notes?: string;
  cyclePhase?: string;
  dayOfCycle?: number;
  synced: boolean;
}

interface MoodStore {
  // Cached entries (keyed by date string YYYY-MM-DD)
  entries: Record<string, LocalMoodEntry>;

  // Actions
  setEntry: (entry: LocalMoodEntry) => void;
  getEntry: (date: string) => LocalMoodEntry | undefined;
  setEntries: (entries: LocalMoodEntry[]) => void;
  deleteEntry: (date: string) => void;
  markSynced: (date: string) => void;
  getEntriesForMonth: (year: number, month: number) => LocalMoodEntry[];
  getUnsyncedEntries: () => LocalMoodEntry[];
}

// Helper to format date as YYYY-MM-DD
export const formatDateKey = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const useMoodStore = create<MoodStore>()(
  persist(
    (set, get) => ({
      entries: {},

      setEntry: (entry) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [entry.date]: entry,
          },
        })),

      getEntry: (date) => get().entries[date],

      setEntries: (entries) =>
        set((state) => {
          const newEntries = { ...state.entries };
          for (const entry of entries) {
            newEntries[entry.date] = entry;
          }
          return { entries: newEntries };
        }),

      deleteEntry: (date) =>
        set((state) => {
          const newEntries = { ...state.entries };
          delete newEntries[date];
          return { entries: newEntries };
        }),

      markSynced: (date) =>
        set((state) => {
          const entry = state.entries[date];
          if (!entry) return state;
          return {
            entries: {
              ...state.entries,
              [date]: { ...entry, synced: true },
            },
          };
        }),

      getEntriesForMonth: (year, month) => {
        const entries = get().entries;
        return Object.values(entries).filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate.getFullYear() === year && entryDate.getMonth() === month;
        });
      },

      getUnsyncedEntries: () => {
        const entries = get().entries;
        return Object.values(entries).filter((entry) => !entry.synced);
      },
    }),
    {
      name: "luna-flow-mood-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Mood level labels and colors
export const moodLevels = [
  { value: 1, label: "Very Low", emoji: "😢", color: "#6366f1" },
  { value: 2, label: "Low", emoji: "😔", color: "#8b5cf6" },
  { value: 3, label: "Neutral", emoji: "😐", color: "#a78bfa" },
  { value: 4, label: "Good", emoji: "😊", color: "#c4b5fd" },
  { value: 5, label: "Great", emoji: "😄", color: "#ddd6fe" },
];

export const energyLevels = [
  { value: 1, label: "Exhausted", emoji: "🔋", color: "#ef4444" },
  { value: 2, label: "Tired", emoji: "😴", color: "#f97316" },
  { value: 3, label: "Moderate", emoji: "⚡", color: "#eab308" },
  { value: 4, label: "Energized", emoji: "✨", color: "#84cc16" },
  { value: 5, label: "High Energy", emoji: "🚀", color: "#22c55e" },
];

// Get color for mood/energy value for heatmap
export const getMoodColor = (mood: number, opacity: number = 1): string => {
  const colors = [
    `rgba(99, 102, 241, ${opacity})`, // 1 - indigo
    `rgba(139, 92, 246, ${opacity})`, // 2 - violet
    `rgba(167, 139, 250, ${opacity})`, // 3 - purple
    `rgba(196, 181, 253, ${opacity})`, // 4 - light purple
    `rgba(221, 214, 254, ${opacity})`, // 5 - very light purple
  ];
  return colors[Math.max(0, Math.min(4, mood - 1))];
};

export const getEnergyColor = (energy: number, opacity: number = 1): string => {
  const colors = [
    `rgba(239, 68, 68, ${opacity})`, // 1 - red (exhausted)
    `rgba(249, 115, 22, ${opacity})`, // 2 - orange (tired)
    `rgba(234, 179, 8, ${opacity})`, // 3 - yellow (moderate)
    `rgba(132, 204, 22, ${opacity})`, // 4 - lime (energized)
    `rgba(34, 197, 94, ${opacity})`, // 5 - green (high energy)
  ];
  return colors[Math.max(0, Math.min(4, energy - 1))];
};
