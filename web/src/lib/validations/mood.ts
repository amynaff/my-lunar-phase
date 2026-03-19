import { z } from "zod";

export const moodEntrySchema = z.object({
  date: z.string(),
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional(),
  cyclePhase: z.string().optional(),
  dayOfCycle: z.number().int().min(1).max(60).optional(),
});

export type MoodEntryInput = z.infer<typeof moodEntrySchema>;
