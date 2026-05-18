import type { BlogCategory, BlogPost, BlogStatus, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type ProfessorBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: BlogCategory;
  status: BlogStatus;
  publishedAt: string;
  coverImage?: string;
  readingMin: number;
  updatedAt: string;
};

type PostWithAuthor = BlogPost & { author: User };

function readingMinutes(body: string) {
  return Math.ceil(body.length / 1000) || 5;
}

export function mapProfessorBlogPost(row: PostWithAuthor): ProfessorBlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    body: row.body,
    category: row.category,
    status: row.status,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    coverImage: row.coverImage ?? undefined,
    readingMin: readingMinutes(row.body),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getProfessorBlogPosts(): Promise<ProfessorBlogPost[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      orderBy: [{ status: "asc" }, { publishedAt: "desc" }],
      include: { author: true },
    });
    return rows.map(mapProfessorBlogPost);
  } catch {
    return [];
  }
}

export async function getProfessorBlogPostBySlug(
  slug: string,
): Promise<ProfessorBlogPost | undefined> {
  try {
    const row = await prisma.blogPost.findUnique({
      where: { slug },
      include: { author: true },
    });
    return row ? mapProfessorBlogPost(row) : undefined;
  } catch {
    return undefined;
  }
}

export const PROFESSOR_STATUS_LABEL: Record<
  BlogStatus,
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
    cls: "border-amber/40 text-amber-soft",
  },
};
