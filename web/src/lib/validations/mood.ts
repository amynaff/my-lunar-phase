import { z } from "zod";

export const moodEntrySchema = z.object({
  date: z.string(),
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional(),
  cyclePhase: z.string().optional(),
  dayOfCycle: z.number().int().min(1).max(60).optional(),
  symptoms: z.array(z.string()).optional(),
  flow: z.enum(["spotting", "light", "medium", "heavy"]).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  waterGlasses: z.number().int().min(0).max(20).optional(),
});

export type MoodEntryInput = z.infer<typeof moodEntrySchema>;
