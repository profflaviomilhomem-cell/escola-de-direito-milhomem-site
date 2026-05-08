import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogEditor } from "@/components/professor/blog-editor";
import { findBlogPost } from "@/data/mock-blog";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = findBlogPost(slug);
  return {
    title: post
      ? `Editar — ${post.title}`
      : "Editar artigo — Painel do professor",
    robots: { index: false, follow: false },
  };
}

export default async function EditarArtigoPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const post = findBlogPost(slug);
  if (!post) notFound();

  return (
    <section className="px-gutter mx-auto max-w-(--container-narrow) py-12 lg:px-12">
      <Link
        href="/professor/blog"
        className="text-paper-700 hover:text-amber font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
      >
        ← Pipeline editorial
      </Link>
      <header className="mt-6 mb-10 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
            Editar artigo
          </p>
          <h1
            className="mt-3 font-serif leading-[1.05]"
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
          >
            {post.title}
          </h1>
        </div>
        {post.status === "publicado" && (
          <Link
            href={`/blog/${post.slug}`}
            className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            Ver artigo público →
          </Link>
        )}
      </header>

      <BlogEditor post={post} />
    </section>
  );
}
