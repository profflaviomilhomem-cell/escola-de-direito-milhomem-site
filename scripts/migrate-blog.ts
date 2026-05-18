/**
 * Importa posts de `src/data/migrated-posts.json` para o Prisma.
 * Execução: npm run migrate:blog
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaClient, type BlogCategory } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL ausente em .env.local");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

type MigratedRow = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  category: string;
  coverImage?: string;
  tags?: string[];
};

function mapCategory(label: string): BlogCategory {
  const n = label.toUpperCase();
  if (n.includes("JURISPRUD") || n.includes("DECIS")) return "ANALISE_DECISAO";
  if (n.includes("DOGM")) return "DOGMATICA";
  if (n.includes("COMENT") || n.includes("NOTÍCIA") || n.includes("NOTICIA")) {
    return "COMENTARIO";
  }
  return "GERAL";
}

function readingMinutes(body: string) {
  return Math.ceil(body.length / 1000) || 5;
}

async function migrate() {
  const jsonPath = join(process.cwd(), "src/data/migrated-posts.json");
  const posts = JSON.parse(readFileSync(jsonPath, "utf8")) as MigratedRow[];

  console.log(`📦 ${posts.length} posts no JSON migrado.`);

  let author = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!author) {
    author = await prisma.user.create({
      data: {
        email: "contato@professorflaviomilhomem.com.br",
        name: "Flávio Milhomem",
        role: "ADMIN",
      },
    });
  }

  for (const post of posts) {
    const publishedAt = new Date(post.publishedAt);
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        publishedAt,
        coverImage: post.coverImage ?? null,
        status: "PUBLISHED",
        category: mapCategory(post.category),
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        publishedAt,
        coverImage: post.coverImage ?? null,
        status: "PUBLISHED",
        category: mapCategory(post.category),
        authorId: author.id,
      },
    });
    console.log(`✓ ${post.slug}`);
  }

  console.log("✅ Migração concluída.");
}

migrate()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
