import { z } from "zod";

export const createStorySchema = z.object({
  category: z.enum(["symptoms", "nutrition", "movement", "lifestyle", "success"]),
  lifeStage: z.enum(["regular", "perimenopause", "menopause", "postmenopause"]),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const createMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  lifeStage: z.enum(["regular", "perimenopause", "menopause", "postmenopause"]).optional(),
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
