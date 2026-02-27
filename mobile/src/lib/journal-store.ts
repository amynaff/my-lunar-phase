import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type JournalEntryType = 'text' | 'voice' | 'both';

export interface JournalEntry {
  id: string;
  date: string; // ISO date string
  title?: string;
  content: string;
  voiceMemoUri?: string;
  voiceMemoDuration?: number; // in seconds
  prompt?: string; // if entry was inspired by a prompt
  cyclePhase?: string;
  dayOfCycle?: number;
  mood?: number; // 1-5
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface JournalStore {
  entries: JournalEntry[];

  // Actions
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;

  // Getters
  getEntryById: (id: string) => JournalEntry | undefined;
  getEntriesByDate: (date: string) => JournalEntry[];
  getEntriesByDateRange: (startDate: string, endDate: string) => JournalEntry[];
  getEntriesByWeek: (date: Date) => JournalEntry[];
  getEntriesByMonth: (year: number, month: number) => JournalEntry[];
  getEntriesByPhase: (phase: string) => JournalEntry[];
  getRecentEntries: (limit?: number) => JournalEntry[];
  searchEntries: (query: string) => JournalEntry[];

  // Stats
  getStreakCount: () => number;
  getTotalEntries: () => number;
  getEntriesThisWeek: () => number;
  getEntriesThisMonth: () => number;
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (6 - day);
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entryData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newEntry: JournalEntry = {
          ...entryData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));

        return id;
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
              : entry
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },

      getEntryById: (id) => {
        return get().entries.find((entry) => entry.id === id);
      },

      getEntriesByDate: (date) => {
        const targetDate = date.split('T')[0];
        return get().entries.filter(
          (entry) => entry.date.split('T')[0] === targetDate
        );
      },

      getEntriesByDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return get().entries.filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= start && entryDate <= end;
        });
      },

      getEntriesByWeek: (date) => {
        const start = getStartOfWeek(date);
        const end = getEndOfWeek(date);
        return get().entries.filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= start && entryDate <= end;
        });
      },

      getEntriesByMonth: (year, month) => {
        return get().entries.filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate.getFullYear() === year && entryDate.getMonth() === month;
        });
      },

      getEntriesByPhase: (phase) => {
        return get().entries.filter((entry) => entry.cyclePhase === phase);
      },

      getRecentEntries: (limit = 10) => {
        return get().entries.slice(0, limit);
      },

      searchEntries: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().entries.filter(
          (entry) =>
            entry.content.toLowerCase().includes(lowerQuery) ||
            entry.title?.toLowerCase().includes(lowerQuery) ||
            entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },

      getStreakCount: () => {
        const entries = get().entries;
        if (entries.length === 0) return 0;

        const uniqueDates = new Set(
          entries.map((e) => e.date.split('T')[0])
        );
        const sortedDates = Array.from(uniqueDates).sort().reverse();

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDates.length; i++) {
          const expectedDate = new Date(today);
          expectedDate.setDate(today.getDate() - i);
          const expectedDateStr = expectedDate.toISOString().split('T')[0];

          if (sortedDates.includes(expectedDateStr)) {
            streak++;
          } else if (i === 0) {
            // Allow starting streak from yesterday if no entry today
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            if (sortedDates.includes(yesterdayStr)) {
              continue;
            }
            break;
          } else {
            break;
          }
        }

        return streak;
      },

      getTotalEntries: () => {
        return get().entries.length;
      },

      getEntriesThisWeek: () => {
        return get().getEntriesByWeek(new Date()).length;
      },

      getEntriesThisMonth: () => {
        const now = new Date();
        return get().getEntriesByMonth(now.getFullYear(), now.getMonth()).length;
      },
    }),
    {
      name: 'luna-flow-journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Journal prompts organized by cycle phase
export const journalPrompts: Record<string, { theme: string; prompts: string[] }> = {
  menstrual: {
    theme: 'Release & Rest',
    prompts: [
      'What do I need to release right now?',
      'How can I be gentler with myself today?',
      'What brought me joy this past cycle?',
      'What emotions am I holding onto that no longer serve me?',
      'How can I honor my need for rest?',
      'What wisdom has my body shared with me today?',
    ],
  },
  follicular: {
    theme: 'New Beginnings',
    prompts: [
      'What new project or idea excites me most?',
      'What do I want to create this cycle?',
      'Where does my curiosity want to lead me?',
      'What seeds am I planting for my future self?',
      'How am I feeling energized and renewed?',
      'What possibilities feel open to me right now?',
    ],
  },
  ovulatory: {
    theme: 'Connection & Expression',
    prompts: [
      'What important truth do I need to speak?',
      'How can I nurture my relationships today?',
      'What makes me feel most confident?',
      'How am I showing up authentically?',
      'What conversations do I want to have?',
      'How can I celebrate myself today?',
    ],
  },
  luteal: {
    theme: 'Completion & Reflection',
    prompts: [
      'What do I need to complete before the next cycle?',
      'How can I create more comfort in my life?',
      'What boundaries do I need to set or maintain?',
      'What am I grateful for this cycle?',
      'How am I honoring my changing energy?',
      'What patterns am I noticing in myself?',
    ],
  },
};

// Quick mood/energy tags for entries
export const journalTags = [
  { id: 'grateful', label: 'Grateful', emoji: '🙏' },
  { id: 'energized', label: 'Energized', emoji: '⚡' },
  { id: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'reflective', label: 'Reflective', emoji: '🪞' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌱' },
  { id: 'loved', label: 'Loved', emoji: '💕' },
  { id: 'motivated', label: 'Motivated', emoji: '🔥' },
];
