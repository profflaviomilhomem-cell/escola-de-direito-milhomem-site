import type { LessonProgressUpsertInput } from "@/schemas/lesson-progress";

export type LessonProgressResponse = {
  watchedSec: number;
  completedAt: string | null;
};

export async function patchLessonProgress(
  input: LessonProgressUpsertInput,
): Promise<{ ok: true; progress: LessonProgressResponse } | { ok: false }> {
  try {
    const res = await fetch("/api/aluno/lessons/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as {
      ok: boolean;
      progress?: LessonProgressResponse;
    };
    if (!data.ok || !data.progress) return { ok: false };
    return { ok: true, progress: data.progress };
  } catch {
    return { ok: false };
  }
}
