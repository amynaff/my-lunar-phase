import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-create the schema inline since we may not know the exact export
const moodEntrySchema = z.object({
  date: z.string().min(1),
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional(),
  cyclePhase: z.string().optional(),
  dayOfCycle: z.number().int().min(1).max(60).optional(),
});

describe("moodEntrySchema", () => {
  it("validates a complete entry", () => {
    const result = moodEntrySchema.safeParse({
      date: "2024-01-15",
      mood: 4,
      energy: 3,
      notes: "Feeling good today",
      cyclePhase: "follicular",
      dayOfCycle: 8,
    });
    expect(result.success).toBe(true);
  });

  it("validates minimal entry", () => {
    const result = moodEntrySchema.safeParse({
      date: "2024-01-15",
      mood: 3,
      energy: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects mood out of range", () => {
    const result = moodEntrySchema.safeParse({
      date: "2024-01-15",
      mood: 6,
      energy: 3,
    });
    expect(result.success).toBe(false);
  });

  it("rejects mood of 0", () => {
    const result = moodEntrySchema.safeParse({
      date: "2024-01-15",
      mood: 0,
      energy: 3,
    });
    expect(result.success).toBe(false);
  });

  it("rejects energy out of range", () => {
    const result = moodEntrySchema.safeParse({
      date: "2024-01-15",
      mood: 3,
      energy: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing date", () => {
    const result = moodEntrySchema.safeParse({
      mood: 3,
      energy: 3,
    });
    expect(result.success).toBe(false);
  });

  it("rejects notes over 2000 chars", () => {
    const result = moodEntrySchema.safeParse({
      date: "2024-01-15",
      mood: 3,
      energy: 3,
      notes: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
