import { requireAdminSession } from "@/lib/auth/require-admin";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogEditor } from "@/components/professor/blog-editor";
import { getProfessorBlogPostBySlug } from "@/lib/blog/professor";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getProfessorBlogPostBySlug(slug);
  return {
    title: post
      ? `Editar — ${post.title}`
      : "Editar artigo — Painel do professor",
    robots: { index: false, follow: false },
  };
}

export default async function EditarArtigoPage({ params }: { params: Params }) {
  await requireAdminSession();
  const { slug } = await params;
  const post = await getProfessorBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <section className="fm-site-page py-12">
      <Link
        href="/professor/blog"
        className="text-paper-700 hover:text-amber font-mono text-[10px] tracking-[0.2em] uppercase transition-colors"
      >
        ← Pipeline editorial
      </Link>
      <header className="mt-6 mb-10 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
            Editar artigo
          </p>
          <h1
            className="fm-title-fluid mt-3 font-serif leading-[1.05]"
            style={fmTitleClamp("28px", "3.5vw", "44px")}
          >
            {post.title}
          </h1>
        </div>
        {post.status === "PUBLISHED" && (
          <Link
            href={`/blog/${post.slug}`}
            className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber border px-4 py-2 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors"
          >
            Ver artigo público →
          </Link>
        )}
      </header>

      <BlogEditor post={post} />
    </section>
  );
}
