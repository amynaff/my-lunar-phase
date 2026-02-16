import { api } from "./api";

export interface MoodEntry {
  id: string;
  userId: string;
  date: string;
  mood: number; // 1-5
  energy: number; // 1-5
  notes: string | null;
  cyclePhase: string | null;
  dayOfCycle: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MoodStats {
  totalEntries: number;
  avgMood: number;
  avgEnergy: number;
  phaseAverages: Array<{
    phase: string;
    avgMood: number;
    avgEnergy: number;
    entryCount: number;
  }>;
}

export const moodApi = {
  // Get mood entries for a date range
  getEntries: async (startDate?: string, endDate?: string): Promise<{ entries: MoodEntry[] }> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString();
    return api.get(`/api/mood/entries${query ? `?${query}` : ""}`);
  },

  // Get single mood entry by date
  getEntry: async (date: string): Promise<{ entry: MoodEntry | null }> => {
    return api.get(`/api/mood/entry/${date}`);
  },

  // Create or update mood entry
  saveEntry: async (data: {
    date: string;
    mood: number;
    energy: number;
    notes?: string;
    cyclePhase?: string;
    dayOfCycle?: number;
  }): Promise<{ entry: MoodEntry }> => {
    return api.post("/api/mood/entry", data);
  },

  // Delete mood entry
  deleteEntry: async (date: string): Promise<{ success: boolean }> => {
    return api.delete(`/api/mood/entry/${date}`);
  },

  // Get mood statistics
  getStats: async (): Promise<MoodStats> => {
    return api.get("/api/mood/stats");
  },
};
