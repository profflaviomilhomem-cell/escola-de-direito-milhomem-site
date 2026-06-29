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
  moduleId: string | null;
  published: boolean;
  publishedAt: string | null;
};

export type LessonInput = {
  slug: string;
  title: string;
  description?: string;
  durationSec?: number;
  videoId?: string;
  moduleId?: string | null;
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
    moduleId: row.moduleId ?? null,
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

type LessonData = {
  slug: string;
  title: string;
  description: string | null;
  durationSec: number | null;
  videoId: string | null;
  publishedAt: Date | null;
  moduleId?: string | null;
};

function dataFromInput(input: LessonInput): LessonData {
  const data: LessonData = {
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
  // Só altera o vínculo de módulo quando o campo é enviado explicitamente
  // (evita zerar o módulo em ações como publicar/despublicar).
  if (input.moduleId !== undefined) {
    data.moduleId = input.moduleId || null;
  }
  return data;
}

/** Garante que o módulo pertence ao curso; caso contrário, desvincula. */
async function sanitizeModuleId(
  productId: string,
  data: LessonData,
): Promise<void> {
  if (data.moduleId) {
    const mod = await prisma.module.findFirst({
      where: { id: data.moduleId, productId },
      select: { id: true },
    });
    if (!mod) data.moduleId = null;
  }
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

  const data = dataFromInput(input);
  await sanitizeModuleId(productId, data);

  const row = await prisma.lesson.create({
    data: { productId, position, ...data },
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
  const data = dataFromInput(input);
  await sanitizeModuleId(productId, data);
  const row = await prisma.lesson.update({
    where: { id: lessonId, productId },
    data,
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
