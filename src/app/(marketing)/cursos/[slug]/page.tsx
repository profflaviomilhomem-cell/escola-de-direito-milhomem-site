import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";

import { EdicaoLancamentoLanding } from "@/components/marketing/edicao-lancamento-landing";
import { CursoProdutoPublico } from "@/components/marketing/curso-produto-publico";
import { JsonLd } from "@/components/shared/json-ld";
import { copy } from "@/config/copy";
import {
  breadcrumbLd,
  edicaoLancamentoCourseLd,
  faqPageLd,
} from "@/lib/seo/jsonld";
import {
  getCatalogProductBySlug,
  getPublishedProductBySlug,
} from "@/lib/marketing/catalog";

type Props = { params: Promise<{ slug: string }> };

const CURSO_SLUG = "prova-digital-no-processo-penal";
/** Slug antigo da landing — redireciona para o slug do curso. */
const EDICAO_SLUG_LEGADO = "edicao-lancamento";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug === CURSO_SLUG) {
    return {
      title:
        "Prova Digital no Processo Penal — Edição Lançamento da Escola Flávio Milhomem",
      description:
        "Curso de prova digital e cadeia de custódia pela perspectiva da acusação. Cohort inaugural de 12 semanas com Flávio Milhomem — turma fundadora, trilha certificada e acesso ao professor no fórum.",
      alternates: { canonical: `/cursos/${CURSO_SLUG}` },
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

  if (slug === EDICAO_SLUG_LEGADO) {
    permanentRedirect(`/cursos/${CURSO_SLUG}`);
  }

  if (slug === CURSO_SLUG) {
    return (
      <>
        <JsonLd
          data={[
            edicaoLancamentoCourseLd(),
            faqPageLd([
              ...copy.edicaoLancamento.faq,
              ...copy.edicaoLancamento.faqExtra,
            ]),
            breadcrumbLd([
              { name: "Início", url: "/" },
              { name: "Cursos", url: "/cursos" },
              {
                name: "Prova Digital no Processo Penal",
                url: `/cursos/${CURSO_SLUG}`,
              },
            ]),
          ]}
        />
        <EdicaoLancamentoLanding />
      </>
    );
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
