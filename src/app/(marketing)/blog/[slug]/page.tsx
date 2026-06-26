import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogArticleBody } from "@/components/marketing/blog-article-body";
import { BlogAnswerFirst, BlogToc } from "@/components/marketing/blog-toc";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/config/site";
import { getBlogArticleBySlug, getRelatedBlogPosts } from "@/lib/blog/content";
import { bodyLooksLikeHtml, hasBlogLeadVideo } from "@/lib/blog/html";
import {
  anchorHeadingsAndExtractToc,
  isQuestionTitle,
  TOC_MIN_ITEMS,
} from "@/lib/blog/toc";
import { DB_CATEGORY_LABEL } from "@/lib/blog/prisma-posts";
import { articleLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogArticleBySlug(slug);
  if (!post) return { title: "Artigo não encontrado" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      authors: [post.author.name ?? "Flávio Milhomem"],
    },
  };
}

/**
 * Página individual do artigo (Puxando do Prisma com fallback mock).
 */
export default async function BlogArtigoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getBlogArticleBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedBlogPosts(slug, 3);

  const bodyIsHtml = bodyLooksLikeHtml(post.body);
  const hasLeadVideo = bodyIsHtml && hasBlogLeadVideo(post.body);

  // AEO (guia 6.7): âncoras nos H2/H3 + índice; resposta direta no topo
  // quando o título é pergunta (o excerpt migra do hero para o corpo).
  const { html: anchoredBody, toc } = bodyIsHtml
    ? anchorHeadingsAndExtractToc(post.body)
    : { html: post.body, toc: [] };
  const showToc = toc.length >= TOC_MIN_ITEMS;
  const answerFirst = isQuestionTitle(post.title) && post.excerpt.length > 0;
  // O layout "vídeo colado no hero" (pb-6/pt-0) só vale quando o vídeo é de
  // fato o primeiro elemento do corpo — resposta direta e índice vêm antes.
  const flushLeadVideo = hasLeadVideo && !answerFirst && !showToc;

  const canonicalUrl = `${siteConfig.url}/blog/${slug}`;

  return (
    <>
      <JsonLd
        data={[
          articleLd(post, canonicalUrl),
          breadcrumbLd([
            { name: "Início", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${slug}` },
          ]),
        ]}
      />

      {/* Cover hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: !post.coverImage
            ? `linear-gradient(135deg, ${post.cover.from}, ${post.cover.to})`
            : undefined,
        }}
      >
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover opacity-40"
            priority
          />
        )}
        <div
          aria-hidden
          className="absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full opacity-15 blur-3xl"
          style={{ background: "var(--color-amber)" }}
        />
        <div className="from-carbon via-carbon/40 absolute inset-0 bg-gradient-to-t to-transparent" />

        <div
          className={`fm-site-page relative z-10 pt-10 ${flushLeadVideo ? "pb-6" : "pb-20"}`}
        >
          <Link
            href="/blog"
            className="text-paper-700 hover:text-amber font-mono text-[11px] tracking-[0.2em] uppercase transition-colors"
          >
            ← Todos os artigos
          </Link>
          <p className="text-amber mt-8 font-mono text-[11px] tracking-[0.2em] uppercase">
            {DB_CATEGORY_LABEL[post.category] || post.category}
          </p>
          <h1
            className="fm-title-fluid mt-4 max-w-4xl font-serif leading-[1.05]"
            style={fmTitleClamp("36px", "5vw", "64px")}
          >
            {post.title}
          </h1>
          {!answerFirst && (
            <p className="text-paper-800 mt-5 max-w-3xl text-lg leading-relaxed md:text-xl">
              {post.excerpt}
            </p>
          )}

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
              <p className="text-paper-600 mt-1 font-mono text-[10px] tracking-[0.2em] uppercase">
                {post.author.role}
              </p>
            </div>
            <span className="border-paper-200 hidden h-8 border-l md:inline-block" />
            <p className="text-paper-700 font-mono text-[10px] tracking-[0.2em] uppercase">
              {post.publishedAt &&
                new Date(post.publishedAt).toLocaleDateString("pt-BR", {
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
      <article
        className={`blog-article fm-site-page max-w-prose-wide pb-page ${flushLeadVideo ? "pt-0" : "py-page"}`}
      >
        {answerFirst && <BlogAnswerFirst text={post.excerpt} />}
        {showToc && <BlogToc items={toc} />}
        <BlogArticleBody body={anchoredBody} isHtml={bodyIsHtml} />

        {/* Tags */}
        <div className="border-paper-100 mt-12 flex flex-wrap items-center gap-2 border-t pt-8">
          <span className="text-paper-600 font-mono text-[10px] tracking-[0.2em] uppercase">
            Tags ·
          </span>
          {post.tags?.map((tag) => (
            <span
              key={tag}
              className="border-paper-200 text-paper-700 border px-3 py-1 font-mono text-[10px] tracking-[0.15em] uppercase"
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
            <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
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
            className="border-amber text-amber hover:bg-amber hover:text-carbon border px-4 py-2 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors"
          >
            Trajetória →
          </Link>
        </aside>
      </article>

      {/* Posts relacionados */}
      {related.length > 0 && (
        <section className="border-paper-100 border-t">
          <div className="fm-site-page py-section">
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
                    <div className="from-carbon via-carbon/30 absolute inset-0 bg-gradient-to-t to-transparent" />
                  </div>
                  <p className="text-amber mt-4 font-mono text-[10px] tracking-[0.2em] uppercase">
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
