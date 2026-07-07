import type { MockLesson, MockLessonStatus } from "@/data/mock-aluno";
import { prisma } from "@/lib/prisma";

const COMPLETION_RATIO = 0.9;

export type LessonProgressRow = {
  watchedSec: number;
  completedAt: Date | null;
};

export async function findLessonBySlugs(
  productSlug: string,
  lessonSlug: string,
) {
  return prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      product: { slug: productSlug },
    },
    select: {
      id: true,
      slug: true,
      durationSec: true,
    },
  });
}

export async function getLessonProgress(
  userId: string,
  productSlug: string,
  lessonSlug: string,
): Promise<LessonProgressRow | null> {
  const lesson = await findLessonBySlugs(productSlug, lessonSlug);
  if (!lesson) return null;

  const row = await prisma.userLessonProgress.findUnique({
    where: {
      userId_lessonId: { userId, lessonId: lesson.id },
    },
    select: { watchedSec: true, completedAt: true },
  });

  return row;
}

export async function upsertLessonProgress(
  userId: string,
  input: {
    productSlug: string;
    lessonSlug: string;
    watchedSec?: number;
    completed?: boolean;
  },
) {
  const lesson = await findLessonBySlugs(input.productSlug, input.lessonSlug);
  if (!lesson) {
    return { ok: false as const, error: "LESSON_NOT_FOUND" as const };
  }

  const durationSec = lesson.durationSec ?? 0;
  const existing = await prisma.userLessonProgress.findUnique({
    where: {
      userId_lessonId: { userId, lessonId: lesson.id },
    },
  });

  let watchedSec = input.watchedSec ?? existing?.watchedSec ?? 0;
  let completedAt = existing?.completedAt ?? null;

  if (input.completed) {
    watchedSec = Math.max(watchedSec, durationSec);
    completedAt = new Date();
  } else if (
    durationSec > 0 &&
    watchedSec >= Math.floor(durationSec * COMPLETION_RATIO)
  ) {
    completedAt = completedAt ?? new Date();
  }

  const row = await prisma.userLessonProgress.upsert({
    where: {
      userId_lessonId: { userId, lessonId: lesson.id },
    },
    create: {
      userId,
      lessonId: lesson.id,
      watchedSec,
      completedAt,
    },
    update: {
      watchedSec,
      completedAt,
    },
    select: {
      watchedSec: true,
      completedAt: true,
      lesson: { select: { slug: true, durationSec: true } },
    },
  });

  return { ok: true as const, progress: row };
}

/**
 * Carrega todo o progresso do usuário de uma vez (SSR de dashboard/listagens).
 * Chave do mapa: `${productSlug}::${lessonSlug}`.
 */
export async function getUserProgressMap(
  userId: string,
): Promise<Map<string, LessonProgressRow>> {
  const map = new Map<string, LessonProgressRow>();
  try {
    const rows = await prisma.userLessonProgress.findMany({
      where: { userId },
      select: {
        watchedSec: true,
        completedAt: true,
        lesson: {
          select: { slug: true, product: { select: { slug: true } } },
        },
      },
    });
    for (const r of rows) {
      map.set(`${r.lesson.product.slug}::${r.lesson.slug}`, {
        watchedSec: r.watchedSec,
        completedAt: r.completedAt,
      });
    }
  } catch {
    // Banco indisponível: mapa vazio mantém o status base do manifest.
  }
  return map;
}

/**
 * Percentual de conteúdo consumido de um produto pelo aluno (0..100) —
 * razão entre aulas concluídas e o total de aulas do curso. Base do cálculo
 * de reembolso proporcional (16–90 dias, ver refundableAmountCents).
 * Banco indisponível ou curso sem aulas → 0 (conservador).
 */
export async function getContentConsumedPct(
  userId: string,
  productSlug: string,
): Promise<number> {
  try {
    const [total, completed] = await Promise.all([
      prisma.lesson.count({ where: { product: { slug: productSlug } } }),
      prisma.userLessonProgress.count({
        where: {
          userId,
          completedAt: { not: null },
          lesson: { product: { slug: productSlug } },
        },
      }),
    ]);
    if (total <= 0) return 0;
    return Math.round((completed / total) * 100);
  } catch {
    return 0;
  }
}

/** Aplica progresso do banco sobre o mock (SSR). */
export function mergeMockLessonProgress(
  lesson: MockLesson,
  row: LessonProgressRow | null,
): MockLesson {
  if (!row) return lesson;

  const durationSec = lesson.durationSec;
  const watchedSec = Math.min(row.watchedSec, durationSec);
  const isComplete = row.completedAt !== null;

  let status: MockLessonStatus = "nao-iniciada";
  if (isComplete) {
    status = "concluida";
  } else if (watchedSec > 0) {
    status = "em-andamento";
  }

  return {
    ...lesson,
    watchedSec: isComplete ? durationSec : watchedSec,
    status,
  };
}
