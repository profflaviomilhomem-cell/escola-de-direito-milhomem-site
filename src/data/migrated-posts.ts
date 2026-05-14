import migratedPostsData from "./migrated-posts.json";

/**
 * Artigos espelhados do WordPress do cliente (`professorflaviomilhomem.com.br`).
 * Atualizar conteúdo/datas/imagens: `npm run sync:blog`
 */
export type MigratedBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  category: string;
  author: {
    name: string;
    avatarSrc?: string;
    role?: string;
  };
  cover: { from: string; to: string };
  coverImage?: string;
  readingMin: number;
  tags: string[];
};

export const migratedPosts = migratedPostsData as MigratedBlogPost[];
