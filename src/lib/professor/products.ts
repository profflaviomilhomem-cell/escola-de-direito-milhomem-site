import type { Product } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  type CourseUpsertInput,
  type ProfessorCourse,
} from "@/lib/professor/product-types";

export type { CourseUpsertInput, ProfessorCourse } from "@/lib/professor/product-types";
export {
  PRODUCT_PUBLISH_LABEL,
  PRODUCT_TYPE_LABEL,
  slugifyCourseName,
} from "@/lib/professor/product-types";

function mapProduct(
  row: Product & { _count?: { lessons: number } },
): ProfessorCourse {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description,
    type: row.type,
    priceCents: row.priceCents,
    coverImage: row.coverImage ?? undefined,
    bannerImage: row.bannerImage ?? undefined,
    publishStatus: row.publishStatus,
    publishedAt: row.publishedAt?.toISOString(),
    active: row.active,
    lessonCount: row._count?.lessons ?? 0,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getProfessorCourses(): Promise<ProfessorCourse[]> {
  const rows = await prisma.product.findMany({
    orderBy: [{ publishStatus: "asc" }, { updatedAt: "desc" }],
    include: { _count: { select: { lessons: true } } },
  });
  return rows.map(mapProduct);
}

export async function getProfessorCourseBySlug(
  slug: string,
): Promise<ProfessorCourse | undefined> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: { _count: { select: { lessons: true } } },
  });
  return row ? mapProduct(row) : undefined;
}

export async function upsertProfessorCourse(
  input: CourseUpsertInput,
  existingId?: string,
): Promise<ProfessorCourse> {
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
  const data = {
    slug: input.slug,
    name: input.name,
    tagline: input.tagline?.trim() || null,
    description: input.description,
    type: input.type,
    priceCents: input.priceCents,
    coverImage: input.coverImage?.trim() || null,
    bannerImage: input.bannerImage?.trim() || null,
    publishStatus: input.publishStatus,
    publishedAt:
      input.publishStatus === "PUBLISHED" ? publishedAt ?? new Date() : publishedAt,
    active: input.active,
  };

  const row = existingId
    ? await prisma.product.update({
        where: { id: existingId },
        data,
        include: { _count: { select: { lessons: true } } },
      })
    : await prisma.product.create({
        data,
        include: { _count: { select: { lessons: true } } },
      });

  return mapProduct(row);
}
