import type { BlogCategory, BlogStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  mapProfessorBlogPost,
  type ProfessorBlogPost,
} from "@/lib/blog/professor";

export type BlogUpsertInput = {
  slug: string;
  title: string;
  excerpt?: string;
  body: string;
  category: BlogCategory;
  status: BlogStatus;
  publishedAt?: string | null;
  coverImage?: string | null;
};

/**
 * Resolve o autor do post para o `authorId` (FK obrigatória em BlogPost).
 * Prefere o usuário da sessão (por e-mail); cai para um ADMIN qualquer.
 * Em sessão dev fake o `sub` pode não existir no banco — por isso usamos e-mail.
 */
export async function resolveAuthorId(session: {
  sub: string;
  email?: string;
}): Promise<string> {
  if (session.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: session.email },
      select: { id: true },
    });
    if (byEmail) return byEmail.id;
  }
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (admin) return admin.id;
  throw new Error("Nenhum usuário ADMIN no banco para vincular como autor.");
}

function buildData(input: BlogUpsertInput) {
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt?.trim() || null,
    body: input.body,
    category: input.category,
    status: input.status,
    coverImage: input.coverImage?.trim() || null,
    // Publicado sem data explícita assume agora; rascunho/agendado preserva o valor.
    publishedAt:
      input.status === "PUBLISHED" ? (publishedAt ?? new Date()) : publishedAt,
  };
}

export async function createBlogPost(
  input: BlogUpsertInput,
  authorId: string,
): Promise<ProfessorBlogPost> {
  const row = await prisma.blogPost.create({
    data: { ...buildData(input), authorId },
    include: { author: true },
  });
  return mapProfessorBlogPost(row);
}

export async function updateBlogPost(
  existingId: string,
  input: BlogUpsertInput,
): Promise<ProfessorBlogPost> {
  const row = await prisma.blogPost.update({
    where: { id: existingId },
    data: buildData(input),
    include: { author: true },
  });
  return mapProfessorBlogPost(row);
}

export async function deleteBlogPost(slug: string): Promise<void> {
  await prisma.blogPost.delete({ where: { slug } });
}
