import type { Product, ProductPublishStatus, ProductType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type ProfessorCourse = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  type: ProductType;
  priceCents: number;
  coverImage?: string;
  bannerImage?: string;
  publishStatus: ProductPublishStatus;
  publishedAt?: string;
  active: boolean;
  lessonCount: number;
  updatedAt: string;
};

export type CourseUpsertInput = {
  slug: string;
  name: string;
  tagline?: string;
  description: string;
  type: ProductType;
  priceCents: number;
  coverImage?: string | null;
  bannerImage?: string | null;
  publishStatus: ProductPublishStatus;
  publishedAt?: string | null;
  active: boolean;
};

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

export const PRODUCT_PUBLISH_LABEL: Record<
  ProductPublishStatus,
  { label: string; cls: string }
> = {
  PUBLISHED: {
    label: "Publicado",
    cls: "border-amber/60 bg-amber/10 text-amber",
  },
  DRAFT: {
    label: "Rascunho",
    cls: "border-paper-200 text-paper-700",
  },
  SCHEDULED: {
    label: "Agendado",
    cls: "border-paper-200 bg-paper-50 text-paper",
  },
};

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  COHORT: "Cohort (12 semanas)",
  TRIPWIRE: "Masterclass / tripwire",
  COMUNIDADE: "Comunidade / assinatura",
  EBOOK: "E-book / legado",
};

export function slugifyCourseName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
