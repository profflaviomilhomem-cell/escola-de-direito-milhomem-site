import type { Metadata } from "next";
import Link from "next/link";

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
  formatPriceBrl,
  getCatalogProductBySlug,
  getCursoPrincipal,
  getPublishedProductBySlug,
} from "@/lib/marketing/catalog";
import { cursoFaqItems } from "@/lib/marketing/curso-faq";
import {
  CURSO_PRINCIPAL_PATH,
  CURSO_PRINCIPAL_SLUG,
} from "@/data/produtos-escola";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug === CURSO_PRINCIPAL_SLUG) {
    const { product, dbDown } = await getCursoPrincipal();
    // Curso despublicado no painel (com banco ok) cai no fluxo genérico.
    if (product || dbDown) {
      return {
        title: "Prova Digital no Processo Penal — Edição Lançamento",
        description:
          "Curso de prova digital e cadeia de custódia pela perspectiva da acusação. Cohort inaugural de 12 semanas com Flávio Milhomem — turma fundadora, trilha certificada e acesso ao professor no fórum.",
        alternates: { canonical: CURSO_PRINCIPAL_PATH },
      };
    }
  }

  const product =
    (await getPublishedProductBySlug(slug)) ??
    (await getCatalogProductBySlug(slug));

  if (product) {
    return {
      title: product.name,
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

  if (slug === CURSO_PRINCIPAL_SLUG) {
    const { product, dbDown } = await getCursoPrincipal();

    // Publicado (ou banco indisponível → fallback estático): landing de venda.
    // Despublicado no painel: cai no fluxo genérico ("não publicado").
    if (product || dbDown) {
      const priceLabel = product
        ? formatPriceBrl(product.priceCents)
        : copy.edicaoLancamento.investimentoPriceMain;
      const faqItems = cursoFaqItems(priceLabel);

      return (
        <>
          <JsonLd
            data={[
              edicaoLancamentoCourseLd({ priceCents: product?.priceCents }),
              faqPageLd(faqItems),
              breadcrumbLd([
                { name: "Início", url: "/" },
                { name: "Cursos", url: "/cursos" },
                {
                  name: "Prova Digital no Processo Penal",
                  url: CURSO_PRINCIPAL_PATH,
                },
              ]),
            ]}
          />
          <EdicaoLancamentoLanding
            priceLabel={priceLabel}
            faqItems={faqItems}
          />
        </>
      );
    }
  }

  const published = await getPublishedProductBySlug(slug);
  if (published) {
    return <CursoProdutoPublico product={published} />;
  }

  const existing = await getCatalogProductBySlug(slug);
  if (existing) {
    return (
      <article className="fm-site-page max-w-prose-wide py-page">
        <h1 className="text-heading-1 text-tinta-700 font-serif">
          {existing.name}
        </h1>
        <p className="mt-4 leading-relaxed text-slate-700">
          Este programa ainda não está publicado na vitrine. Volte em breve ou
          entre em contato para saber sobre a próxima turma.
        </p>
        <Link
          href="/cursos"
          className="text-amber mt-6 inline-block font-mono text-[11px] tracking-widest uppercase hover:underline"
        >
          ← Voltar aos cursos
        </Link>
      </article>
    );
  }

  return (
    <article className="fm-site-page max-w-prose-wide py-page">
      <h1 className="text-heading-1 text-tinta-700 font-serif">
        Curso não encontrado
      </h1>
      <p className="mt-4 leading-relaxed text-slate-700">
        O endereço pode estar incorreto ou o programa foi removido do catálogo.
      </p>
      <Link
        href="/cursos"
        className="text-amber mt-6 inline-block font-mono text-[11px] tracking-widest uppercase hover:underline"
      >
        ← Voltar aos cursos
      </Link>
    </article>
  );
}
