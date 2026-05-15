import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { publishedBlogPosts } from "@/data/mock-blog";
import { migratedPosts } from "@/data/migrated-posts";
import {
  blogListHref,
  filterPostsByPublishedRange,
  resolveDateRangeFromSearchParams,
} from "@/lib/blog/date-filter";
import {
  DB_CATEGORY_LABEL,
  mapPrismaPostToList,
  type BlogListPost,
} from "@/lib/blog/prisma-posts";
import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/marketing/blog-card";

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

/**
 * Listagem do blog (Puxando do Prisma com fallback para mock).
 * Grelha paginada: 9 cards por página (`?page=2`…); o destaque editorial
 * continua a ser sempre o primeiro post.
 */
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

  let posts: BlogListPost[] = [];

  try {
    const dbPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { author: true },
    });

    if (dbPosts.length > 0) {
      posts = dbPosts.map(mapPrismaPostToList);
    } else if (migratedPosts.length > 0) {
      posts = migratedPosts;
    } else {
      posts = publishedBlogPosts();
    }
  } catch (error) {
    console.warn("Falha ao buscar posts do Prisma, usando dados locais:", error);
    posts = migratedPosts.length > 0 ? migratedPosts : publishedBlogPosts();
  }

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

      {/* Filtros por data + atalhos */}
      <div className="border-paper-100 bg-carbon-elevated/60 mb-12 border p-5 md:p-6">
        <p className="text-amber fm-mono text-[10px] uppercase tracking-[0.18em]">
          Filtrar por data de publicação
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`fm-mono border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${
              !hasDateFilter
                ? "border-amber bg-amber/10 text-amber"
                : "border-paper-200 text-paper-700 hover:border-amber hover:text-amber"
            }`}
          >
            Todas
          </Link>
          {PRESETS.map((p) => {
            const active = activePeriodo === p.periodo;
            return (
              <Link
                key={p.periodo}
                href={blogListHref({ periodo: p.periodo })}
                className={`fm-mono border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "border-amber bg-amber/10 text-amber"
                    : "border-paper-200 text-paper-700 hover:border-amber hover:text-amber"
                }`}
              >
                {p.label}
              </Link>
            );
          })}
          {yearChips.map((y) => {
            const key = String(y);
            const active = activePeriodo === key;
            return (
              <Link
                key={key}
                href={blogListHref({ periodo: key })}
                className={`fm-mono border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "border-amber bg-amber/10 text-amber"
                    : "border-paper-200 text-paper-700 hover:border-amber hover:text-amber"
                }`}
              >
                Ano {y}
              </Link>
            );
          })}
        </div>

        <form
          action="/blog"
          method="get"
          className="border-paper-100 mt-6 flex flex-wrap items-end gap-4 border-t pt-6"
        >
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-paper-600 fm-mono text-[10px] uppercase tracking-[0.14em]">
                De
              </span>
              <input
                type="date"
                name="de"
                defaultValue={de ?? ""}
                className="border-paper-200 focus:border-amber bg-carbon text-paper border px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-paper-600 fm-mono text-[10px] uppercase tracking-[0.14em]">
                Até
              </span>
              <input
                type="date"
                name="ate"
                defaultValue={ate ?? ""}
                className="border-paper-200 focus:border-amber bg-carbon text-paper border px-3 py-2 text-sm outline-none"
              />
            </label>
          </div>
          <button
            type="submit"
            className="border-amber text-amber hover:bg-amber hover:text-carbon fm-mono border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors"
          >
            Aplicar intervalo
          </button>
          {hasDateFilter && (
            <Link
              href="/blog"
              className="text-paper-600 hover:text-paper fm-mono py-2 text-[11px] uppercase tracking-[0.14em] underline-offset-4 hover:underline"
            >
              Limpar datas
            </Link>
          )}
        </form>
        {hasDateFilter && (
          <p className="text-paper-600 fm-mono mt-4 text-xs">
            Intervalo ativo:{" "}
            <span className="text-paper">
              {de ? new Date(de + "T12:00:00").toLocaleDateString("pt-BR") : "…"}
            </span>
            {" → "}
            <span className="text-paper">
              {ate
                ? new Date(ate + "T12:00:00").toLocaleDateString("pt-BR")
                : "…"}
            </span>
            {" · "}
            {filteredPosts.length} artigo
            {filteredPosts.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

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

      {/* Featured */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group relative block no-underline"
        >
          <div
            className="border-paper-100 group-hover:border-amber relative aspect-[16/9] w-full overflow-hidden border md:aspect-[21/9] bg-carbon"
            style={{
              backgroundImage: !featured.coverImage ? `linear-gradient(135deg, ${featured.cover.from}, ${featured.cover.to})` : undefined,
            }}
          >
            {featured.coverImage && (
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            )}
            <div
              aria-hidden
              className="absolute -right-24 top-0 h-full w-1/2 rounded-full opacity-15 blur-3xl"
              style={{ background: "var(--color-amber)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-carbon/85 via-carbon/30 to-transparent" />

            <div className="relative z-10 flex h-full max-w-3xl flex-col justify-end p-6 md:p-12">
              <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
                Em destaque · {DB_CATEGORY_LABEL[featured.category] || featured.category}
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
        </Link>
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
