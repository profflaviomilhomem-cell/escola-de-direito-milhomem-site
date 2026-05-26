import type { Metadata } from "next";
import Link from "next/link";

import { EdicaoLancamentoLanding } from "@/components/marketing/edicao-lancamento-landing";
import { CursoProdutoPublico } from "@/components/marketing/curso-produto-publico";
import {
  getCatalogProductBySlug,
  getPublishedProductBySlug,
} from "@/lib/marketing/catalog";

type Props = { params: Promise<{ slug: string }> };

const EDICAO_SLUG = "edicao-lancamento";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug === EDICAO_SLUG) {
    return {
      title: "Edição Lançamento — direito criminal pela perspectiva da acusação",
      description:
        "Cohort inaugural de 12 semanas com Flávio Milhomem. Turma fundadora, trilha certificada e acesso ao professor no fórum.",
      alternates: { canonical: `/cursos/${EDICAO_SLUG}` },
    };
  }

  const product =
    (await getPublishedProductBySlug(slug)) ??
    (await getCatalogProductBySlug(slug));

  if (product) {
    return {
      title: `${product.name} — Escola Flávio Milhomem`,
      description: product.tagline ?? product.description.slice(0, 160),
      alternates: { canonical: `/cursos/${slug}` },
      robots:
        product.publishStatus === "PUBLISHED"
          ? undefined
          : { index: false, follow: false },
    };
  }

  return { title: `Curso · ${slug}`, robots: { index: false } };
}

export default async function CursoSlugPage({ params }: Props) {
  const { slug } = await params;

  if (slug === EDICAO_SLUG) {
    return <EdicaoLancamentoLanding />;
  }

  const published = await getPublishedProductBySlug(slug);
  if (published) {
    return <CursoProdutoPublico product={published} />;
  }

  const existing = await getCatalogProductBySlug(slug);
  if (existing) {
    return (
      <article className="fm-site-page max-w-prose-wide py-page">
        <h1 className="font-serif text-heading-1 text-tinta-700">
          {existing.name}
        </h1>
        <p className="text-slate-700 mt-4 leading-relaxed">
          Este programa ainda não está publicado na vitrine. Volte em breve ou
          entre em contato para saber sobre a próxima turma.
        </p>
        <Link
          href="/cursos"
          className="text-amber hover:underline mt-6 inline-block font-mono text-[11px] uppercase tracking-widest"
        >
          ← Voltar aos cursos
        </Link>
      </article>
    );
  }

  return (
    <article className="fm-site-page max-w-prose-wide py-page">
      <h1 className="font-serif text-heading-1 text-tinta-700">
        Curso não encontrado
      </h1>
      <p className="text-slate-700 mt-4 leading-relaxed">
        O endereço pode estar incorreto ou o programa foi removido do catálogo.
      </p>
      <Link
        href="/cursos"
        className="text-amber hover:underline mt-6 inline-block font-mono text-[11px] uppercase tracking-widest"
      >
        ← Voltar aos cursos
      </Link>
    </article>
  );
}
