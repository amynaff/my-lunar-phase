import { z } from "zod";

export const acceptInviteSchema = z.object({
  code: z.string().length(6),
});

export const syncCycleSchema = z.object({
  lifeStage: z.string(),
  currentPhase: z.string(),
  dayOfCycle: z.number().int().optional(),
  cycleLength: z.number().int().optional(),
  moonPhase: z.string().optional(),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type SyncCycleInput = z.infer<typeof syncCycleSchema>;
