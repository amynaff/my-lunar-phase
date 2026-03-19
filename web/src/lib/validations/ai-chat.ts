import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  lifeStage: z.string().optional(),
  currentPhase: z.string().optional(),
  moonPhase: z.string().optional(),
});

export const quickAdviceSchema = z.object({
  topic: z.enum(["nutrition", "movement", "selfcare", "symptoms"]),
  lifeStage: z.string().optional(),
  currentPhase: z.string().optional(),
  moonPhase: z.string().optional(),
});

export const symptomCheckSchema = z.object({
  symptoms: z.array(z.string()).min(1),
  severity: z.enum(["mild", "moderate", "severe"]).optional(),
  duration: z.string().optional(),
  lifeStage: z.string().optional(),
  currentPhase: z.string().optional(),
  moonPhase: z.string().optional(),
});
