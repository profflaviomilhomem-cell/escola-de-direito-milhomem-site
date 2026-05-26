import type { ProductPublishStatus, ProductType } from "@prisma/client";

/** Tipos e labels compartilhados — seguro para Client Components (sem Prisma). */

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
