"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface JournalEntry {
  id: string;
  date: string;
  title?: string;
  content: string;
  prompt?: string;
  cyclePhase?: string;
  dayOfCycle?: number;
  mood?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface JournalStore {
  entries: JournalEntry[];

  addEntry: (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => string;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;

  getEntryById: (id: string) => JournalEntry | undefined;
  getEntriesByDate: (date: string) => JournalEntry[];
  getEntriesByWeek: (date: Date) => JournalEntry[];
  getEntriesByMonth: (year: number, month: number) => JournalEntry[];
  getRecentEntries: (limit?: number) => JournalEntry[];
  searchEntries: (query: string) => JournalEntry[];

  getStreakCount: () => number;
  getTotalEntries: () => number;
  getEntriesThisWeek: () => number;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (6 - day));
  d.setHours(23, 59, 59, 999);
  return d;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entryData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newEntry: JournalEntry = { ...entryData, id, createdAt: now, updatedAt: now };
        set((state) => ({ entries: [newEntry, ...state.entries] }));
        return id;
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
      },

      getEntryById: (id) => get().entries.find((e) => e.id === id),

      getEntriesByDate: (date) => {
        const target = date.split("T")[0];
        return get().entries.filter((e) => e.date.split("T")[0] === target);
      },

      getEntriesByWeek: (date) => {
        const start = getStartOfWeek(date);
        const end = getEndOfWeek(date);
        return get().entries.filter((e) => {
          const d = new Date(e.date);
          return d >= start && d <= end;
        });
      },

      getEntriesByMonth: (year, month) => {
        return get().entries.filter((e) => {
          const d = new Date(e.date);
          return d.getFullYear() === year && d.getMonth() === month;
        });
      },

      getRecentEntries: (limit = 10) => get().entries.slice(0, limit),

      searchEntries: (query) => {
        const q = query.toLowerCase();
        return get().entries.filter(
          (e) =>
            e.content.toLowerCase().includes(q) ||
            e.title?.toLowerCase().includes(q) ||
            e.tags.some((t) => t.toLowerCase().includes(q))
        );
      },

      getStreakCount: () => {
        const entries = get().entries;
        if (entries.length === 0) return 0;
        const uniqueDates = new Set(entries.map((e) => e.date.split("T")[0]));
        const sortedDates = Array.from(uniqueDates).sort().reverse();
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < sortedDates.length; i++) {
          const expected = new Date(today);
          expected.setDate(today.getDate() - i);
          const expectedStr = expected.toISOString().split("T")[0];
          if (sortedDates.includes(expectedStr)) {
            streak++;
          } else if (i === 0) {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            if (sortedDates.includes(yesterday.toISOString().split("T")[0])) continue;
            break;
          } else {
            break;
          }
        }
        return streak;
      },

      getTotalEntries: () => get().entries.length,

      getEntriesThisWeek: () => get().getEntriesByWeek(new Date()).length,
    }),
    {
      name: "luna-journal-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const journalPrompts: Record<string, { theme: string; prompts: string[] }> = {
  menstrual: {
    theme: "Release & Rest",
    prompts: [
      "What do I need to release right now?",
      "How can I be gentler with myself today?",
      "What brought me joy this past cycle?",
      "What emotions am I holding onto that no longer serve me?",
      "How can I honor my need for rest?",
      "What wisdom has my body shared with me today?",
    ],
  },
  follicular: {
    theme: "New Beginnings",
    prompts: [
      "What new project or idea excites me most?",
      "What do I want to create this cycle?",
      "Where does my curiosity want to lead me?",
      "What seeds am I planting for my future self?",
      "How am I feeling energized and renewed?",
      "What possibilities feel open to me right now?",
    ],
  },
  ovulatory: {
    theme: "Connection & Expression",
    prompts: [
      "What important truth do I need to speak?",
      "How can I nurture my relationships today?",
      "What makes me feel most confident?",
      "How am I showing up authentically?",
      "What conversations do I want to have?",
      "How can I celebrate myself today?",
    ],
  },
  luteal: {
    theme: "Completion & Reflection",
    prompts: [
      "What do I need to complete before the next cycle?",
      "How can I create more comfort in my life?",
      "What boundaries do I need to set or maintain?",
      "What am I grateful for this cycle?",
      "How am I honoring my changing energy?",
      "What patterns am I noticing in myself?",
    ],
  },
};

export const moonJournalPrompts: Record<string, { theme: string; prompts: string[] }> = {
  new_moon: {
    theme: "Intention Setting",
    prompts: [
      "What intentions am I setting for this lunar cycle?",
      "What do I want to invite into my life?",
      "What does my inner wisdom tell me right now?",
    ],
  },
  waxing_crescent: {
    theme: "Growth & Trust",
    prompts: [
      "How are my intentions taking root?",
      "What small step can I take today toward my vision?",
      "Where do I need to trust the process more?",
    ],
  },
  first_quarter: {
    theme: "Action & Courage",
    prompts: [
      "What bold action am I being called to take?",
      "What challenges are strengthening me?",
      "How can I stay committed to my path?",
    ],
  },
  waxing_gibbous: {
    theme: "Refinement",
    prompts: [
      "What needs refining in my life right now?",
      "How can I be more patient with my progress?",
      "What am I learning about myself this cycle?",
    ],
  },
  full_moon: {
    theme: "Celebration & Release",
    prompts: [
      "What am I ready to celebrate?",
      "What no longer serves me that I can release?",
      "How has my light grown since the new moon?",
    ],
  },
  waning_gibbous: {
    theme: "Gratitude & Sharing",
    prompts: [
      "What wisdom can I share with others?",
      "What am I most grateful for today?",
      "How can I give back to my community?",
    ],
  },
  last_quarter: {
    theme: "Letting Go",
    prompts: [
      "What do I need to forgive — in myself or others?",
      "What clutter (physical or mental) can I clear?",
      "How am I making space for what matters?",
    ],
  },
  waning_crescent: {
    theme: "Rest & Renewal",
    prompts: [
      "How can I honor my need for stillness?",
      "What has this lunar cycle taught me?",
      "What do I want to carry into the next cycle?",
    ],
  },
};

export const journalTags = [
  { id: "grateful", label: "Grateful", emoji: "🙏" },
  { id: "energized", label: "Energized", emoji: "⚡" },
  { id: "peaceful", label: "Peaceful", emoji: "🕊️" },
  { id: "creative", label: "Creative", emoji: "🎨" },
  { id: "reflective", label: "Reflective", emoji: "🪞" },
  { id: "anxious", label: "Anxious", emoji: "😰" },
  { id: "tired", label: "Tired", emoji: "😴" },
  { id: "hopeful", label: "Hopeful", emoji: "🌱" },
  { id: "loved", label: "Loved", emoji: "💕" },
  { id: "motivated", label: "Motivated", emoji: "🔥" },
];
