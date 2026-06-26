import Link from "next/link";

import { getPublishedBlogListPosts } from "@/lib/blog/content";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";
import { DB_CATEGORY_LABEL } from "@/lib/blog/prisma-posts";
import { BlogCard } from "./blog-card";

/**
 * Seção de Blog para a Home - Traz os 3 posts mais recentes.
 */
export async function BlogSection() {
  const posts = (await getPublishedBlogListPosts()).slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="fm-site-section py-24 lg:py-32">
      <div className="fm-site-container">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-amber mb-4 font-mono text-[10px] tracking-[0.2em] uppercase">
              Análise e Dogmática
            </p>
            <h2
              className="fm-title-fluid text-paper font-serif leading-[1.1]"
              style={fmTitleClamp("40px", "5vw", "72px")}
            >
              O penal pelo{" "}
              <em className="text-amber italic">ângulo da acusação</em>.
            </h2>
          </div>
          <Link
            href="/blog"
            className="border-amber text-paper hover:text-amber inline-block border-b pb-1 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors"
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
