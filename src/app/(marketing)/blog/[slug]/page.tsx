import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CATEGORY_LABEL,
  findBlogPost as findMockPost,
  relatedPosts as findMockRelated,
} from "@/data/mock-blog";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ slug: string }>;

// Map de categorias do DB para o label mock (ajuste conforme necessário)
const DB_CATEGORY_LABEL: Record<string, string> = {
  ANALISE_DECISAO: "Análise de decisão",
  DOGMATICA: "Dogmática aplicada",
  COMENTARIO: "Comentário atual",
  GERAL: "Geral",
};

async function getPostData(slug: string) {
  try {
    const p = await prisma.blogPost.findUnique({
      where: { slug },
      include: { author: true },
    });

    if (p) {
      return {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        body: p.body,
        category: p.category,
        publishedAt: p.publishedAt?.toISOString(),
        author: {
          name: p.author.name,
          role: "Professor de Direito Criminal",
          avatarSrc: "/images/professor/flavio-avatar-64.jpg",
        },
        cover: { from: "#06172f", to: "#0a2a4d" },
        readingMin: Math.ceil(p.body.length / 1000) || 5,
        tags: ["Geral"],
      };
    }
  } catch (e) {
    console.warn("DB offline ou post não encontrado no Prisma, usando mock.");
  }
  return findMockPost(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostData(slug);
  if (!post) return { title: "Artigo não encontrado" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}

/**
 * Página individual do artigo (Puxando do Prisma com fallback mock).
 */
export default async function BlogArtigoPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const post = await getPostData(slug);
  if (!post) notFound();

  // Related posts fallback: tenta do DB, se não mock
  let related: any[] = [];
  try {
    const dbRelated = await prisma.blogPost.findMany({
      where: { slug: { not: slug }, status: "PUBLISHED" },
      take: 3,
    });
    related = dbRelated.length > 0 
      ? dbRelated.map(p => ({
          slug: p.slug,
          title: p.title,
          category: p.category,
          cover: { from: "#06172f", to: "#0a2a4d" }
        }))
      : findMockRelated(slug, 3);
  } catch {
    related = findMockRelated(slug, 3);
  }

  // Schema Article (rich results)
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.author.name },
    keywords: post.tags?.join(", ") || "",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      {/* Cover hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${post.cover.from}, ${post.cover.to})`,
        }}
      >
        <div
          aria-hidden
          className="absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full opacity-15 blur-3xl"
          style={{ background: "var(--color-amber)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent" />

        <div className="relative z-10 px-gutter mx-auto max-w-(--container-narrow) pt-32 pb-20 lg:px-12">
          <Link
            href="/blog"
            className="text-paper-700 hover:text-amber font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            ← Todos os artigos
          </Link>
          <p className="text-amber mt-8 font-mono text-[11px] uppercase tracking-[0.2em]">
            {DB_CATEGORY_LABEL[post.category] || post.category}
          </p>
          <h1
            className="mt-4 max-w-4xl font-serif leading-[1.05]"
            style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
          >
            {post.title}
          </h1>
          <p className="text-paper-800 mt-5 max-w-3xl text-lg leading-relaxed md:text-xl">
            {post.excerpt}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {post.author.avatarSrc && (
              <Image
                src={post.author.avatarSrc}
                alt={post.author.name}
                width={44}
                height={44}
                className="border-amber/60 h-11 w-11 rounded-full border-2 object-cover"
              />
            )}
            <div>
              <p className="text-paper text-sm font-semibold">
                {post.author.name}
              </p>
              <p className="text-paper-600 mt-1 font-mono text-[10px] uppercase tracking-[0.2em]">
                {post.author.role}
              </p>
            </div>
            <span className="border-paper-200 hidden h-8 border-l md:inline-block" />
            <p className="text-paper-700 font-mono text-[10px] uppercase tracking-[0.2em]">
              {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}{" "}
              · {post.readingMin} min de leitura
            </p>
          </div>
        </div>
      </section>

      {/* Corpo do artigo */}
      <article className="px-gutter mx-auto max-w-prose-wide py-page lg:px-12">
        <div className="prose-juridica space-y-6 text-[18px] leading-[1.8]">
          {post.body.split(/\n\n+/).map((paragraph, i) => (
            <p
              key={i}
              className="text-paper-800"
              dangerouslySetInnerHTML={{
                __html: paragraph
                  .replace(/\*\*(.+?)\*\*/g, '<strong class="text-paper">$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em class="text-amber italic">$1</em>'),
              }}
            />
          ))}
        </div>

        {/* Tags */}
        <div className="border-paper-100 mt-12 flex flex-wrap items-center gap-2 border-t pt-8">
          <span className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
            Tags ·
          </span>
          {post.tags?.map((tag) => (
            <span
              key={tag}
              className="border-paper-200 text-paper-700 border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bio do autor — bloco mais editorial */}
        <aside className="border-amber/30 bg-amber/5 mt-12 flex flex-wrap items-center gap-6 border-l-2 px-6 py-6 md:px-10">
          {post.author.avatarSrc && (
            <Image
              src={post.author.avatarSrc}
              alt={post.author.name}
              width={64}
              height={64}
              className="border-amber h-16 w-16 rounded-full border-2 object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
              Sobre o autor
            </p>
            <p className="text-paper mt-2 font-serif text-xl leading-tight">
              {post.author.name}
            </p>
            <p className="text-paper-700 mt-2 text-sm leading-relaxed">
              {post.author.role} · 30 anos de carreira institucional, mestre
              pela Universidade Católica Portuguesa.
            </p>
          </div>
          <Link
            href="/sobre"
            className="border-amber text-amber hover:bg-amber hover:text-carbon border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            Trajetória →
          </Link>
        </aside>
      </article>

      {/* Posts relacionados */}
      {related.length > 0 && (
        <section className="border-paper-100 border-t">
          <div className="px-gutter mx-auto max-w-(--container-narrow) py-section lg:px-12">
            <h2 className="text-paper mb-8 font-serif text-3xl">
              Continue lendo
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block no-underline"
                >
                  <div
                    className="border-paper-100 group-hover:border-amber relative aspect-[16/9] overflow-hidden border transition-colors"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${p.cover.from}, ${p.cover.to})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />
                  </div>
                  <p className="text-amber mt-4 font-mono text-[10px] uppercase tracking-[0.2em]">
                    {DB_CATEGORY_LABEL[p.category] || p.category}
                  </p>
                  <h3 className="text-paper group-hover:text-amber mt-2 font-serif text-lg leading-tight transition-colors">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
