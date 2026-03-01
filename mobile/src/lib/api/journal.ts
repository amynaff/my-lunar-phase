import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

// ==================== TYPES ====================

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  title: string | null;
  content: string;
  mood: number | null;
  energy: number | null;
  symptoms: string[];
  tags: string[];
  cyclePhase: string | null;
  dayOfCycle: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalInsight {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  confidence: number;
  relatedTags: string[];
  relatedPhases: string[];
  dateRange: { startDate: string; endDate: string } | null;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export interface JournalStats {
  totalEntries: number;
  entriesThisMonth: number;
  entriesThisWeek: number;
  currentStreak: number;
  longestStreak: number;
  avgMood: number | null;
  avgEnergy: number | null;
  topTags: Array<{ tag: string; count: number }>;
  phaseBreakdown: Array<{ phase: string; count: number }>;
}

export interface QuickCheckInData {
  mood?: number;
  note?: string;
  tags?: string[];
  cyclePhase?: string;
  dayOfCycle?: number;
}

export interface EntriesQueryParams {
  startDate?: string;
  endDate?: string;
  cyclePhase?: string;
  limit?: number;
}

export interface EntriesResponse {
  entries: JournalEntry[];
  total: number;
  hasMore: boolean;
}

export interface InsightsResponse {
  insights: JournalInsight[];
  total: number;
}

export interface AnalyzeResponse {
  success: boolean;
  insightsGenerated: number;
}

// ==================== API FUNCTIONS ====================

export async function fetchJournalEntries(
  params?: EntriesQueryParams
): Promise<EntriesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.startDate) queryParams.set("startDate", params.startDate);
  if (params?.endDate) queryParams.set("endDate", params.endDate);
  if (params?.cyclePhase) queryParams.set("cyclePhase", params.cyclePhase);
  if (params?.limit) queryParams.set("limit", params.limit.toString());

  const query = queryParams.toString();
  return api.get<EntriesResponse>(
    `/api/journal/entries${query ? `?${query}` : ""}`
  );
}

export async function fetchJournalEntry(
  id: string
): Promise<{ entry: JournalEntry }> {
  return api.get<{ entry: JournalEntry }>(`/api/journal/entries/${id}`);
}

export async function createJournalEntry(data: {
  date?: string;
  title?: string;
  content: string;
  mood?: number;
  energy?: number;
  symptoms?: string[];
  tags?: string[];
  cyclePhase?: string;
  dayOfCycle?: number;
}): Promise<{ entry: JournalEntry }> {
  return api.post<{ entry: JournalEntry }>("/api/journal/entries", data);
}

export async function updateJournalEntry(
  id: string,
  data: {
    title?: string;
    content?: string;
    mood?: number;
    energy?: number;
    symptoms?: string[];
    tags?: string[];
    cyclePhase?: string;
    dayOfCycle?: number;
  }
): Promise<{ entry: JournalEntry }> {
  return api.put<{ entry: JournalEntry }>(`/api/journal/entries/${id}`, data);
}

export async function deleteJournalEntry(
  id: string
): Promise<{ success: boolean }> {
  return api.delete<{ success: boolean }>(`/api/journal/entries/${id}`);
}

export async function quickCheckIn(
  data: QuickCheckInData
): Promise<{ entry: JournalEntry }> {
  return api.post<{ entry: JournalEntry }>("/api/journal/quick-check-in", data);
}

export async function fetchJournalInsights(): Promise<InsightsResponse> {
  return api.get<InsightsResponse>("/api/journal/insights");
}

export async function markInsightAsRead(
  id: string
): Promise<{ insight: JournalInsight }> {
  return api.post<{ insight: JournalInsight }>(
    `/api/journal/insights/${id}/read`,
    {}
  );
}

export async function dismissInsight(
  id: string
): Promise<{ insight: JournalInsight }> {
  return api.post<{ insight: JournalInsight }>(
    `/api/journal/insights/${id}/dismiss`,
    {}
  );
}

export async function triggerPatternAnalysis(): Promise<AnalyzeResponse> {
  return api.post<AnalyzeResponse>("/api/journal/analyze", {});
}

export async function fetchJournalStats(): Promise<JournalStats> {
  return api.get<JournalStats>("/api/journal/stats");
}

// ==================== REACT QUERY HOOKS ====================

// Query Keys
export const journalKeys = {
  all: ["journal"] as const,
  entries: () => [...journalKeys.all, "entries"] as const,
  entriesList: (params?: EntriesQueryParams) =>
    [...journalKeys.entries(), params] as const,
  entry: (id: string) => [...journalKeys.entries(), id] as const,
  insights: () => [...journalKeys.all, "insights"] as const,
  stats: () => [...journalKeys.all, "stats"] as const,
};

// Entries Hooks
export function useJournalEntries(params?: EntriesQueryParams) {
  return useQuery({
    queryKey: journalKeys.entriesList(params),
    queryFn: () => fetchJournalEntries(params),
  });
}

export function useJournalEntry(id: string) {
  return useQuery({
    queryKey: journalKeys.entry(id),
    queryFn: () => fetchJournalEntry(id),
    enabled: !!id,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.entries() });
      queryClient.invalidateQueries({ queryKey: journalKeys.stats() });
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateJournalEntry>[1] }) =>
      updateJournalEntry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: journalKeys.entry(variables.id) });
      queryClient.invalidateQueries({ queryKey: journalKeys.entries() });
      queryClient.invalidateQueries({ queryKey: journalKeys.stats() });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.entries() });
      queryClient.invalidateQueries({ queryKey: journalKeys.stats() });
    },
  });
}

// Quick Check-In Hook
export function useQuickCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quickCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.entries() });
      queryClient.invalidateQueries({ queryKey: journalKeys.stats() });
    },
  });
}

// Insights Hooks
export function useJournalInsights() {
  return useQuery({
    queryKey: journalKeys.insights(),
    queryFn: fetchJournalInsights,
  });
}

export function useMarkInsightAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markInsightAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.insights() });
    },
  });
}

export function useDismissInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dismissInsight,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.insights() });
    },
  });
}

// Pattern Analysis Hook
export function useTriggerPatternAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerPatternAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.insights() });
    },
  });
}

// Stats Hook
export function useJournalStats() {
  return useQuery({
    queryKey: journalKeys.stats(),
    queryFn: fetchJournalStats,
  });
}
