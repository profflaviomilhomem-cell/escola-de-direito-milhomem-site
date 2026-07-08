import { cache } from "react";

import {
  mapPrismaPostToArticle,
  mapPrismaPostToList,
  type BlogArticlePost,
  type BlogFeedItem,
  type BlogListPost,
  type BlogRelatedPost,
} from "@/lib/blog/prisma-posts";
import { prisma } from "@/lib/prisma";

async function fetchPublishedFromDb(): Promise<BlogListPost[]> {
  const rows = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { author: true },
  });
  return rows.map(mapPrismaPostToList);
}

/** Posts publicados (Prisma). Sem fallback mock.
 *  `cache()` deduplica a consulta dentro do mesmo request
 *  (lista + relacionados + feed compartilham o resultado). */
export const getPublishedBlogListPosts = cache(
  async (): Promise<BlogListPost[]> => {
    try {
      return await fetchPublishedFromDb();
    } catch {
      return [];
    }
  },
);

/** `cache()` deduplica entre generateMetadata e a página do artigo. */
export const getBlogArticleBySlug = cache(
  async (slug: string): Promise<BlogArticlePost | undefined> => {
    try {
      const row = await prisma.blogPost.findUnique({
        where: { slug },
        include: { author: true },
      });
      if (row?.status === "PUBLISHED") return mapPrismaPostToArticle(row);
    } catch {
      /* offline */
    }
    return undefined;
  },
);

export async function getBlogPostMeta(
  slug: string,
): Promise<{ title: string; category: string } | undefined> {
  try {
    const row = await prisma.blogPost.findUnique({
      where: { slug },
      select: { title: true, category: true, status: true },
    });
    if (row?.status === "PUBLISHED") {
      return { title: row.title, category: row.category };
    }
  } catch {
    /* offline */
  }
  return undefined;
}

export async function getRelatedBlogPosts(
  slug: string,
  limit = 3,
): Promise<BlogRelatedPost[]> {
  const posts = await getPublishedBlogListPosts();
  const current = posts.find((p) => p.slug === slug);
  const others = posts.filter((p) => p.slug !== slug);

  // Prioriza a mesma categoria (relevância) e completa por recência;
  // a lista já vem ordenada por data, então a ordem se preserva.
  const sameCategory = current
    ? others.filter((p) => p.category === current.category)
    : [];
  const sameSlugs = new Set(sameCategory.map((p) => p.slug));
  const ordered = [
    ...sameCategory,
    ...others.filter((p) => !sameSlugs.has(p.slug)),
  ].slice(0, limit);

  return ordered.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    coverImage: p.coverImage,
    cover: p.cover,
  }));
}

export async function getBlogFeedItems(limit = 20): Promise<BlogFeedItem[]> {
  const posts = await getPublishedBlogListPosts();
  return posts.slice(0, limit).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    publishedAt: new Date(p.publishedAt ?? Date.now()),
  }));
}
