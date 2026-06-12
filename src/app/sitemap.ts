import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { copy } from "@/config/copy";
import { CURSO_PRINCIPAL_PATH } from "@/data/produtos-escola";
import { getPublishedBlogListPosts } from "@/lib/blog/content";

/**
 * Sitemap dinâmico (guia 7.2).
 *
 * `lastModified` só é declarado quando a data é real (posts — `updatedAt`
 * do banco). Para páginas estáticas a data de build seria um sinal falso
 * de frescor, então o campo é omitido e fica o `changeFrequency`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/sobre`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/cursos`, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${base}${CURSO_PRINCIPAL_PATH}`,
      changeFrequency: "weekly",
      priority: 1,
    },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/newsletter`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/livros`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/contato`, changeFrequency: "yearly", priority: 0.5 },
    {
      url: `${base}/eventos/dia-do-advogado-2026`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/calculadora-de-pena`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/termos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/reembolso`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const materialSlugs = Object.keys(copy.materiais.bySlug);
  const materialPages: MetadataRoute.Sitemap = materialSlugs.map((slug) => ({
    url: `${base}/materiais/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogPosts = await getPublishedBlogListPosts();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => {
    const lastModified = post.modifiedAt ?? post.publishedAt;
    return {
      url: `${base}/blog/${post.slug}`,
      ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  return [...staticPages, ...materialPages, ...blogPages];
}
