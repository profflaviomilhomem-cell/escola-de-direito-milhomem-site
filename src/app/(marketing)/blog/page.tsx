import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  CATEGORY_LABEL,
  publishedBlogPosts,
} from "@/data/mock-blog";

export const metadata: Metadata = {
  title: "Blog — Escola Flávio Milhomem",
  description:
    "Análise de decisões do STJ/STF, dogmática aplicada e comentários atuais sobre Direito Penal e Processo Penal pelo ângulo da acusação.",
  alternates: { canonical: "/blog" },
};

/**
 * Listagem do blog (blueprint Seção 8.5).
 * Três tipos editoriais: análise de decisão · dogmática aplicada ·
 * comentário atual. Cadência: 4-5 artigos/mês inicialmente.
 *
 * Layout: hero editorial + featured (post mais recente em destaque) +
 * grid 3 colunas com os demais. Cards usam o gradient cover do post.
 */
export default function BlogPage() {
  const posts = publishedBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <section className="px-gutter py-page mx-auto max-w-(--container-narrow) lg:px-12">
      {/* Hero editorial */}
      <header className="mb-16 max-w-3xl">
        <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
          Bastidor da acusação · Blog
        </p>
        <h1
          className="mt-4 font-serif leading-[1.02]"
          style={{ fontSize: "clamp(48px, 6vw, 88px)" }}
        >
          O penal pelo{" "}
          <em className="text-amber italic">ângulo da acusação</em>.
        </h1>
        <p className="text-paper-700 mt-6 text-base leading-relaxed md:text-lg">
          Análises de decisões recentes do STJ e STF, dogmática aplicada à
          prática forense e comentários sobre o que move a agenda
          institucional. Sem opinião sem prova; sem prova sem ângulo.
        </p>
      </header>

      {/* Featured */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group relative block no-underline"
        >
          <div
            className="border-paper-100 group-hover:border-amber relative aspect-[16/9] w-full overflow-hidden border md:aspect-[21/9]"
            style={{
              backgroundImage: `linear-gradient(135deg, ${featured.cover.from}, ${featured.cover.to})`,
            }}
          >
            <div
              aria-hidden
              className="absolute -right-24 top-0 h-full w-1/2 rounded-full opacity-15 blur-3xl"
              style={{ background: "var(--color-amber)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-carbon/85 via-carbon/30 to-transparent" />

            <div className="relative z-10 flex h-full max-w-3xl flex-col justify-end p-6 md:p-12">
              <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
                Em destaque · {CATEGORY_LABEL[featured.category]}
              </p>
              <h2
                className="text-paper group-hover:text-amber mt-3 font-serif leading-[1.05] transition-colors"
                style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
              >
                {featured.title}
              </h2>
              <p className="text-paper-800 mt-4 max-w-2xl text-base leading-relaxed">
                {featured.excerpt}
              </p>
              <div className="text-paper-600 mt-5 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
                <span>
                  {new Date(featured.publishedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span aria-hidden>·</span>
                <span>{featured.readingMin} min de leitura</span>
                <span aria-hidden>·</span>
                <span>{featured.author.name}</span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Grid demais posts */}
      {rest.length > 0 && (
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block no-underline">
                <div
                  className="border-paper-100 group-hover:border-amber relative aspect-[16/9] overflow-hidden border transition-colors"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${post.cover.from}, ${post.cover.to})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
                      {CATEGORY_LABEL[post.category]}
                    </p>
                  </div>
                </div>
                <h3 className="text-paper group-hover:text-amber mt-4 font-serif text-xl leading-tight transition-colors">
                  {post.title}
                </h3>
                <p className="text-paper-700 mt-3 line-clamp-3 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="text-paper-600 mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em]">
                  <Image
                    src={post.author.avatarSrc}
                    alt={post.author.name}
                    width={20}
                    height={20}
                    className="border-amber/60 h-5 w-5 rounded-full border object-cover"
                  />
                  <span>{post.author.name.split(" ")[0]}</span>
                  <span aria-hidden>·</span>
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{post.readingMin} min</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Newsletter CTA — porta de entrada pro lead capture */}
      <aside className="border-amber/30 bg-amber/5 mt-20 flex flex-wrap items-center justify-between gap-6 border-l-2 px-6 py-8 md:px-10">
        <div>
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
            Bastidor quinzenal
          </p>
          <h2 className="text-paper mt-2 font-serif text-2xl leading-tight">
            Receba a análise antes de virar artigo público.
          </h2>
        </div>
        <Link
          href="/newsletter"
          className="bg-amber text-carbon hover:bg-amber-soft inline-flex items-center gap-2 px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors"
        >
          Assinar boletim →
        </Link>
      </aside>
    </section>
  );
}
