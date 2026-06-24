import type { Lesson } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type ProfessorLesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  position: number;
  durationSec: number;
  videoId: string;
  published: boolean;
  publishedAt: string | null;
};

export type LessonInput = {
  slug: string;
  title: string;
  description?: string;
  durationSec?: number;
  videoId?: string;
  published?: boolean;
};

function mapLesson(row: Lesson): ProfessorLesson {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    position: row.position,
    durationSec: row.durationSec ?? 0,
    videoId: row.videoId ?? "",
    published: row.publishedAt != null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

async function productIdBySlug(slug: string): Promise<string | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  return p?.id ?? null;
}

export async function listProductLessons(
  productSlug: string,
): Promise<ProfessorLesson[]> {
  const productId = await productIdBySlug(productSlug);
  if (!productId) return [];
  const rows = await prisma.lesson.findMany({
    where: { productId },
    orderBy: { position: "asc" },
  });
  return rows.map(mapLesson);
}

function dataFromInput(input: LessonInput) {
  return {
    slug: input.slug,
    title: input.title,
    description: input.description?.trim() || null,
    durationSec:
      input.durationSec != null && input.durationSec > 0
        ? Math.round(input.durationSec)
        : null,
    videoId: input.videoId?.trim() || null,
    publishedAt: input.published ? new Date() : null,
  };
}

export async function createLesson(
  productSlug: string,
  input: LessonInput,
): Promise<ProfessorLesson | null> {
  const productId = await productIdBySlug(productSlug);
  if (!productId) return null;

  const last = await prisma.lesson.findFirst({
    where: { productId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1;

  const row = await prisma.lesson.create({
    data: { productId, position, ...dataFromInput(input) },
  });
  return mapLesson(row);
}

export async function updateLesson(
  productSlug: string,
  lessonId: string,
  input: LessonInput,
): Promise<ProfessorLesson | null> {
  const productId = await productIdBySlug(productSlug);
  if (!productId) return null;
  const row = await prisma.lesson.update({
    where: { id: lessonId, productId },
    data: dataFromInput(input),
  });
  return mapLesson(row);
}

export async function deleteLesson(
  productSlug: string,
  lessonId: string,
): Promise<boolean> {
  const productId = await productIdBySlug(productSlug);
  if (!productId) return false;
  await prisma.lesson.delete({ where: { id: lessonId, productId } });
  return true;
}

/** Troca a posição da aula com a vizinha (cima/baixo). */
export async function moveLesson(
  productSlug: string,
  lessonId: string,
  direction: "up" | "down",
): Promise<boolean> {
  const productId = await productIdBySlug(productSlug);
  if (!productId) return false;

  const current = await prisma.lesson.findFirst({
    where: { id: lessonId, productId },
    select: { id: true, position: true },
  });
  if (!current) return false;

  const neighbor = await prisma.lesson.findFirst({
    where: {
      productId,
      position:
        direction === "up"
          ? { lt: current.position }
          : { gt: current.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
    select: { id: true, position: true },
  });
  if (!neighbor) return false;

  await prisma.$transaction([
    prisma.lesson.update({
      where: { id: current.id },
      data: { position: neighbor.position },
    }),
    prisma.lesson.update({
      where: { id: neighbor.id },
      data: { position: current.position },
    }),
  ]);
  return true;
}
