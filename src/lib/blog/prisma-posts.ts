import type { BlogPost, User } from "@prisma/client";

/** Gradiente padrão de capa (identidade visual atual). */
export const BLOG_COVER = { from: "#030024", to: "#0c0a38" } as const;

export const DB_CATEGORY_LABEL: Record<string, string> = {
  ANALISE_DECISAO: "Análise de decisão",
  DOGMATICA: "Dogmática aplicada",
  COMENTARIO: "Comentário atual",
  GERAL: "Geral",
};

const DEFAULT_AUTHOR = {
  name: "Flávio Milhomem",
  role: "Professor de Direito Criminal",
  avatarSrc: "/images/professor/flavio-avatar-64.jpg",
} as const;

export type BlogListPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  publishedAt?: string;
  /** ISO — última edição (sitemap `lastModified`, sinal de frescor). */
  modifiedAt?: string;
  author: { name: string; avatarSrc?: string; role?: string };
  cover: { from: string; to: string };
  readingMin: number;
};

export type BlogArticlePost = BlogListPost & {
  body: string;
  tags: string[];
  /** ISO — última edição (schema.org `dateModified`, sinal de frescor). */
  modifiedAt?: string;
};

export type BlogRelatedPost = {
  slug: string;
  title: string;
  category: string;
  coverImage?: string;
  cover: { from: string; to: string };
};

export type BlogFeedItem = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
};

type PostWithAuthor = BlogPost & { author: User };

function readingMinutes(body: string) {
  return Math.ceil(body.length / 1000) || 5;
}

export function mapPrismaPostToList(p: PostWithAuthor): BlogListPost {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? "",
    category: p.category,
    coverImage: p.coverImage ?? undefined,
    publishedAt: p.publishedAt?.toISOString(),
    modifiedAt: p.updatedAt?.toISOString(),
    author: {
      name: p.author.name ?? DEFAULT_AUTHOR.name,
      avatarSrc: DEFAULT_AUTHOR.avatarSrc,
    },
    cover: { ...BLOG_COVER },
    readingMin: readingMinutes(p.body),
  };
}

export function mapPrismaPostToArticle(p: PostWithAuthor): BlogArticlePost {
  return {
    ...mapPrismaPostToList(p),
    body: p.body,
    author: {
      name: p.author.name ?? DEFAULT_AUTHOR.name,
      role: DEFAULT_AUTHOR.role,
      avatarSrc: DEFAULT_AUTHOR.avatarSrc,
    },
    tags: ["Geral"],
    modifiedAt: p.updatedAt?.toISOString(),
  };
}

export function mapPrismaPostToRelated(p: BlogPost): BlogRelatedPost {
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    coverImage: p.coverImage ?? undefined,
    cover: { ...BLOG_COVER },
  };
}

export function mapPrismaPostToFeed(p: BlogPost): BlogFeedItem {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? "",
    publishedAt: p.publishedAt ?? p.createdAt,
  };
}
