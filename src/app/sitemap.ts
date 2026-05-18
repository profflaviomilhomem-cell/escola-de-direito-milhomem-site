import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { copy } from "@/config/copy";
import { getPublishedBlogListPosts } from "@/lib/blog/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = siteConfig.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/sobre`, lastModified: now, priority: 0.8 },
    { url: `${base}/cursos`, lastModified: now, priority: 0.9 },
    {
      url: `${base}/cursos/edicao-lancamento`,
      lastModified: now,
      priority: 1,
    },
    { url: `${base}/blog`, lastModified: now, priority: 0.8 },
    { url: `${base}/newsletter`, lastModified: now, priority: 0.9 },
    { url: `${base}/contato`, lastModified: now, priority: 0.5 },
    {
      url: `${base}/eventos/dia-do-advogado-2026`,
      lastModified: now,
      priority: 0.9,
    },
    {
      url: `${base}/calculadora-de-pena`,
      lastModified: now,
      priority: 0.8,
    },
    { url: `${base}/privacidade`, lastModified: now, priority: 0.3 },
    { url: `${base}/termos`, lastModified: now, priority: 0.3 },
    { url: `${base}/reembolso`, lastModified: now, priority: 0.3 },
  ];

  const materialSlugs = Object.keys(copy.materiais.bySlug);
  const materialPages: MetadataRoute.Sitemap = materialSlugs.map((slug) => ({
    url: `${base}/materiais/${slug}`,
    lastModified: now,
    priority: 0.6,
  }));

  const blogPosts = await getPublishedBlogListPosts();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt ?? now),
    priority: 0.7,
  }));

  return [...staticPages, ...materialPages, ...blogPages];
}
