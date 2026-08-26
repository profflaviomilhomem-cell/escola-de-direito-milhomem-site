import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EdicaoLancamentoLanding } from "@/components/marketing/edicao-lancamento-landing";
import { CursoProdutoPublico } from "@/components/marketing/curso-produto-publico";
import { JsonLd } from "@/components/shared/json-ld";
import { TrackEvent } from "@/components/shared/track-event";
import { copy } from "@/config/copy";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  breadcrumbLd,
  edicaoLancamentoCourseLd,
  faqPageLd,
} from "@/lib/seo/jsonld";
import {
  formatPriceBrl,
  getCatalogProductBySlug,
  getCohortVagas,
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
      const vagas = await getCohortVagas();

      return (
        <>
          <TrackEvent
            event={ANALYTICS_EVENTS.CART_VIEWED}
            props={{
              product_slug: CURSO_PRINCIPAL_SLUG,
              product_type: product?.type ?? "COHORT",
              price: product ? product.priceCents / 100 : null,
            }}
          />
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
            vagas={vagas}
          />
        </>
      );
    }
  }

  const published = await getPublishedProductBySlug(slug);
  if (published) {
    return (
      <>
        <TrackEvent
          event={ANALYTICS_EVENTS.CART_VIEWED}
          props={{
            product_slug: published.slug,
            product_type: published.type,
            price: published.priceCents / 100,
          }}
        />
        <CursoProdutoPublico product={published} />
      </>
    );
  }

  // 26/08/2026 — removido: um ramo que respondia 200 exibindo `existing.name`
  // para produto que existe no catálogo mas NÃO está publicado.
  //
  // Isso era um oráculo. Quem chutasse endereços sob /cursos/ distinguia três
  // respostas — produto publicado, produto em rascunho (com o NOME impresso na
  // tela) e slug inventado —, e o nome de um produto ainda não anunciado é
  // exatamente o tipo de informação que a Escola controla o tempo de divulgar.
  // Não era regressão de hoje: o oráculo já existia no texto da página, com
  // status 200 nos três casos. Só ficou visível quando a correção do soft 404
  // separou os status.
  //
  // Agora rascunho e inexistente respondem a mesma coisa. Se um dia for preciso
  // mostrar "em breve" para quem tem o link, o caminho é uma página própria com
  // endereço próprio, e não um vazamento por diferença de resposta.

  // 26/08/2026: aqui havia uma página "Curso não encontrado" escrita à mão,
  // devolvida com status **200**. Soft 404: para o Google, um endereço
  // inventado sob /cursos/ era uma página válida do catálogo, e entrava no
  // índice competindo com as reais. `notFound()` renderiza o mesmo tipo de
  // aviso e devolve 404 de verdade.
  notFound();
}
