import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  blogListHref,
  filterPostsByPublishedRange,
  resolveDateRangeFromSearchParams,
} from "@/lib/blog/date-filter";
import { getPublishedBlogListPosts } from "@/lib/blog/content";
import { DB_CATEGORY_LABEL } from "@/lib/blog/prisma-posts";
import { BlogCard } from "@/components/marketing/blog-card";
import { BlogDateFilter } from "@/components/marketing/blog-date-filter";

export const metadata: Metadata = {
  title: "Blog — Escola Flávio Milhomem",
  description:
    "Análise de decisões do STJ/STF, dogmática aplicada e comentários atuais sobre Direito Penal e Processo Penal pelo ângulo da acusação.",
  alternates: { canonical: "/blog" },
};

const PAGE_SIZE = 9;

const PRESETS: Array<{ periodo: string; label: string }> = [
  { periodo: "7d", label: "Últimos 7 dias" },
  { periodo: "30d", label: "Últimos 30 dias" },
  { periodo: "90d", label: "Últimos 90 dias" },
  { periodo: "365d", label: "Último ano" },
  { periodo: "ano-atual", label: "Este ano" },
];

/** Listagem do blog — `getPublishedBlogListPosts()`, 9 cards por página. */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    de?: string;
    ate?: string;
    periodo?: string;
  }>;
}) {
  const sp = await searchParams;
  const { page: pageParam } = sp;
  const parsed = parseInt(pageParam ?? "1", 10);
  const requestedPage =
    Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;

  const posts = await getPublishedBlogListPosts();

  const { de, ate, periodo: activePeriodo } = resolveDateRangeFromSearchParams(
    {
      page: sp.page,
      de: typeof sp.de === "string" ? sp.de : undefined,
      ate: typeof sp.ate === "string" ? sp.ate : undefined,
      periodo: typeof sp.periodo === "string" ? sp.periodo : undefined,
    },
  );

  const filteredPosts = filterPostsByPublishedRange(posts, de, ate);

  const [featured, ...rest] = filteredPosts;

  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageSlice = rest.slice(start, start + PAGE_SIZE);

  const hasDateFilter = Boolean(de || ate);
  const yearNow = new Date().getFullYear();
  const yearChips = [yearNow, yearNow - 1, yearNow - 2];

  const pageHref = (p: number) =>
    blogListHref({
      page: p <= 1 ? undefined : p,
      de,
      ate,
      periodo: activePeriodo,
    });

  return (
    <section className="fm-site-page py-page">
      {/* Hero editorial */}
      <header className="mb-10 max-w-3xl md:mb-14">
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

      <BlogDateFilter
        hasDateFilter={hasDateFilter}
        activePeriodo={activePeriodo ?? undefined}
        de={de ?? undefined}
        ate={ate ?? undefined}
        filteredCount={filteredPosts.length}
        yearChips={yearChips}
        presets={PRESETS}
      />

      {filteredPosts.length === 0 ? (
        <div className="border-paper-100 bg-carbon-elevated border p-12 text-center">
          <p className="text-paper font-serif text-xl">
            Nenhum artigo neste intervalo de datas.
          </p>
          <p className="text-paper-600 fm-mono mt-3 text-sm">
            Ajuste o filtro ou{" "}
            <Link href="/blog" className="text-amber hover:underline">
              volte à listagem completa
            </Link>
            .
          </p>
        </div>
      ) : null}

      {/* Featured — mobile: título abaixo da imagem (evita corte por overflow) */}
      {featured && (
        <article className="group">
          <Link href={`/blog/${featured.slug}`} className="block no-underline">
            <div
              className="border-paper-100 group-hover:border-amber relative aspect-[16/9] w-full overflow-hidden border bg-carbon md:aspect-[21/9]"
              style={{
                backgroundImage: !featured.coverImage
                  ? `linear-gradient(135deg, ${featured.cover.from}, ${featured.cover.to})`
                  : undefined,
              }}
            >
              {featured.coverImage && (
                <Image
                  src={featured.coverImage}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              )}
              <div
                aria-hidden
                className="absolute -right-24 top-0 hidden h-full w-1/2 rounded-full opacity-15 blur-3xl md:block"
                style={{ background: "var(--color-amber)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent md:via-carbon/30" />
              <div className="absolute inset-0 hidden bg-gradient-to-r from-carbon/85 via-carbon/30 to-transparent md:block" />

              <p className="text-amber absolute bottom-0 left-0 z-10 p-4 font-mono text-[10px] uppercase tracking-[0.2em] md:hidden">
                Em destaque · {DB_CATEGORY_LABEL[featured.category] || featured.category}
              </p>

              <div className="relative z-10 hidden h-full max-w-3xl flex-col justify-end p-12 md:flex">
                <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
                  Em destaque · {DB_CATEGORY_LABEL[featured.category] || featured.category}
                </p>
                <h2
                  className="text-paper group-hover:text-amber mt-3 font-serif leading-[1.05] transition-colors"
                  style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
                >
                  {featured.title}
                </h2>
                <p className="text-paper-800 mt-4 line-clamp-3 max-w-2xl text-base leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="text-paper-600 mt-5 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
                  <span>
                    {featured.publishedAt &&
                      new Date(featured.publishedAt).toLocaleDateString("pt-BR", {
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

            <div className="mt-4 md:hidden">
              <h2 className="text-paper group-hover:text-amber font-serif text-xl leading-snug transition-colors">
                {featured.title}
              </h2>
              <p className="text-paper-700 mt-3 line-clamp-3 text-sm leading-relaxed">
                {featured.excerpt}
              </p>
              <div className="text-paper-600 mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em]">
                <span>
                  {featured.publishedAt &&
                    new Date(featured.publishedAt).toLocaleDateString("pt-BR", {
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
          </Link>
        </article>
      )}

      {/* Grid demais posts — 9 por página (3×3 em desktop) */}
      {rest.length > 0 && (
        <>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pageSlice.map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                categoryLabel={
                  DB_CATEGORY_LABEL[post.category] || post.category
                }
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="border-paper-100 mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8"
              aria-label="Paginação do blog"
            >
              <p className="text-paper-600 fm-mono text-sm">
                Página {currentPage} de {totalPages} · {rest.length} artigo
                {rest.length === 1 ? "" : "s"} na grelha
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={pageHref(currentPage - 1)}
                    className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber fm-mono border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors"
                  >
                    ← Anterior
                  </Link>
                ) : (
                  <span className="text-paper-600 fm-mono cursor-not-allowed border border-transparent px-4 py-2 text-[11px] uppercase tracking-[0.16em] opacity-40">
                    ← Anterior
                  </span>
                )}
                {currentPage < totalPages ? (
                  <Link
                    href={pageHref(currentPage + 1)}
                    className="border-amber text-amber hover:bg-amber hover:text-carbon fm-mono border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors"
                  >
                    Seguinte →
                  </Link>
                ) : (
                  <span className="text-paper-600 fm-mono cursor-not-allowed border border-transparent px-4 py-2 text-[11px] uppercase tracking-[0.16em] opacity-40">
                    Seguinte →
                  </span>
                )}
              </div>
            </nav>
          )}
        </>
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
