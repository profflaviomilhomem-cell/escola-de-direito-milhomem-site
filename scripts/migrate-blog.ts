import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Carrega envs do .env.local
dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

/**
 * Script de migração do blog antigo (WordPress) para o novo banco (Prisma).
 * Execução: npx tsx scripts/migrate-blog.ts
 */
async function migrate() {
  const WP_URL =
    "https://professorflaviomilhomem.com.br/wp-json/wp/v2/posts?per_page=100&_embed";

  console.log("🚀 Iniciando busca de posts no WordPress (com imagens)...");

  try {
    const response = await fetch(WP_URL);
    if (!response.ok) {
      throw new Error(`Erro ao buscar posts: ${response.statusText}`);
    }

    const posts = await response.json() as any[];
    console.log(`📦 Encontrados ${posts.length} posts.`);

    // Tenta encontrar o autor principal (ADMIN)
    let author = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!author) {
      console.log("⚠️ Usuário ADMIN não encontrado. Criando perfil de Flávio Milhomem...");
      author = await prisma.user.create({
        data: {
          email: "contato@professorflaviomilhomem.com.br",
          name: "Flávio Milhomem",
          role: "ADMIN",
        },
      });
    }

    for (const wpPost of posts) {
      const slug = wpPost.slug;
      const title = decodeHtmlEntities(wpPost.title.rendered);
      // Remove tags HTML do resumo e limpa espaços
      const excerpt = wpPost.excerpt.rendered
        .replace(/<[^>]*>?/gm, "")
        .trim();
      const body = wpPost.content.rendered;
      const publishedAt = new Date(wpPost.date);

      // Busca imagem de destaque nos dados embutidos (_embed)
      const coverImage = wpPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

      console.log(`📝 Migrando: ${title} (${slug}) ${coverImage ? "📸" : "🌑"}`);

      await prisma.blogPost.upsert({
        where: { slug },
        update: {
          title,
          excerpt,
          body,
          publishedAt,
          coverImage,
          status: "PUBLISHED",
        },
        create: {
          slug,
          title,
          excerpt,
          body,
          publishedAt,
          coverImage,
          status: "PUBLISHED",
          authorId: author.id,
          category: "GERAL",
        },
      });
    }


    console.log("✅ Migração concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
  }
}

/**
 * Helper simples para decodificar entidades HTML comuns vindas do WP (como &#8211;)
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&");
}

migrate()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
