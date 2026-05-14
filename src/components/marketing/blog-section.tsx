import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { migratedPosts } from "@/data/migrated-posts";
import { publishedBlogPosts } from "@/data/mock-blog";
import { BlogCard } from "./blog-card";

const DB_CATEGORY_LABEL: Record<string, string> = {
  ANALISE_DECISAO: "Análise de decisão",
  DOGMATICA: "Dogmática aplicada",
  COMENTARIO: "Comentário atual",
  GERAL: "Geral",
};

/**
 * Seção de Blog para a Home - Traz os 3 posts mais recentes.
 */
export async function BlogSection() {
  let posts: any[] = [];

  try {
    const dbPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { author: true },
    });

    if (dbPosts.length > 0) {
      posts = dbPosts.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        coverImage:
          (p as { coverImage?: string | null }).coverImage ?? undefined,
        publishedAt: p.publishedAt?.toISOString(),
        author: {
          name: p.author.name ?? "Flávio Milhomem",
          avatarSrc: "/images/professor/flavio-avatar-64.jpg",
        },
        cover: { from: "#06172f", to: "#0a2a4d" },
        readingMin: Math.ceil(p.body.length / 1000) || 5,
      }));
    } else if (migratedPosts && migratedPosts.length > 0) {
      posts = migratedPosts.slice(0, 3);
    } else {
      posts = publishedBlogPosts().slice(0, 3);
    }
  } catch (error) {
    posts = migratedPosts.length > 0 ? migratedPosts.slice(0, 3) : publishedBlogPosts().slice(0, 3);
  }

  if (posts.length === 0) return null;

  return (
    <section className="relative z-10 px-[5%] py-32 bg-carbon">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em] mb-4">
              Análise e Dogmática
            </p>
            <h2 className="font-serif leading-[1.1] text-paper" style={{ fontSize: "clamp(40px, 5vw, 72px)" }}>
              O penal pelo <em className="text-amber italic">ângulo da acusação</em>.
            </h2>
          </div>
          <Link 
            href="/blog" 
            className="border-amber text-paper hover:text-amber inline-block border-b font-mono text-[11px] uppercase tracking-[0.2em] transition-colors pb-1"
          >
            Ver todos os artigos →
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard 
              key={post.slug} 
              post={post} 
              categoryLabel={DB_CATEGORY_LABEL[post.category]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
