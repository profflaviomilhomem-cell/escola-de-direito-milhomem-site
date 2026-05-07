import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Sitemap dinâmico — referenciado pelo robots.txt em /public.
 * Em ondas futuras, listar artigos do blog e cursos do Prisma.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = siteConfig.url;

  return [
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
  ];
}
