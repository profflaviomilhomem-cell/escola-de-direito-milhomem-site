import type { Module } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type ProfessorModule = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  position: number;
  lessonCount: number;
};

export type ModuleInput = {
  slug: string;
  title: string;
  subtitle?: string;
};

function mapModule(
  row: Module & { _count?: { lessons: number } },
): ProfessorModule {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    position: row.position,
    lessonCount: row._count?.lessons ?? 0,
  };
}

async function productIdBySlug(slug: string): Promise<string | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  return p?.id ?? null;
}

export async function listProductModules(
  productSlug: string,
): Promise<ProfessorModule[]> {
  const productId = await productIdBySlug(productSlug);
  if (!productId) return [];
  const rows = await prisma.module.findMany({
    where: { productId },
    orderBy: { position: "asc" },
    include: { _count: { select: { lessons: true } } },
  });
  return rows.map(mapModule);
}

function dataFromInput(input: ModuleInput) {
  return {
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle?.trim() || null,
  };
}

export async function createModule(
  productSlug: string,
  input: ModuleInput,
): Promise<ProfessorModule | null> {
  const productId = await productIdBySlug(productSlug);
  if (!productId) return null;

  const last = await prisma.module.findFirst({
    where: { productId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1;

  const row = await prisma.module.create({
    data: { productId, position, ...dataFromInput(input) },
    include: { _count: { select: { lessons: true } } },
  });
  return mapModule(row);
}

export async function updateModule(
  productSlug: string,
  moduleId: string,
  input: ModuleInput,
): Promise<ProfessorModule | null> {
  const productId = await productIdBySlug(productSlug);
  if (!productId) return null;
  const row = await prisma.module.update({
    where: { id: moduleId, productId },
    data: dataFromInput(input),
    include: { _count: { select: { lessons: true } } },
  });
  return mapModule(row);
}

export async function deleteModule(
  productSlug: string,
  moduleId: string,
): Promise<boolean> {
  const productId = await productIdBySlug(productSlug);
  if (!productId) return false;
  // Aulas vinculadas têm moduleId zerado (onDelete: SetNull no schema).
  await prisma.module.delete({ where: { id: moduleId, productId } });
  return true;
}

/** Troca a posição do módulo com o vizinho (cima/baixo). */
export async function moveModule(
  productSlug: string,
  moduleId: string,
  direction: "up" | "down",
): Promise<boolean> {
  const productId = await productIdBySlug(productSlug);
  if (!productId) return false;

  const current = await prisma.module.findFirst({
    where: { id: moduleId, productId },
    select: { id: true, position: true },
  });
  if (!current) return false;

  const neighbor = await prisma.module.findFirst({
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
    prisma.module.update({
      where: { id: current.id },
      data: { position: neighbor.position },
    }),
    prisma.module.update({
      where: { id: neighbor.id },
      data: { position: current.position },
    }),
  ]);
  return true;
}
