import { z } from "zod";

export const lessonProgressUpsertSchema = z.object({
  productSlug: z.string().trim().min(1).max(120),
  lessonSlug: z.string().trim().min(1).max(160),
  watchedSec: z
    .number()
    .int()
    .min(0)
    .max(60 * 60 * 12)
    .optional(),
  completed: z.boolean().optional(),
});

export type LessonProgressUpsertInput = z.infer<
  typeof lessonProgressUpsertSchema
>;
