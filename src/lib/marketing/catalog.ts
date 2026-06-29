import { cache } from "react";

import type { Product, ProductType } from "@prisma/client";

import type { ProdutoEscola } from "@/data/produtos-escola";
import {
  COHORT_VAGAS_TOTAL,
  CURSO_PRINCIPAL_SLUG,
  produtosEscola,
} from "@/data/produtos-escola";
import { ORDER_STATUSES_WITH_ACCESS } from "@/lib/business/commercial-rules";
import { prisma } from "@/lib/prisma";

export type CohortVagas = {
  total: number;
  preenchidas: number;
  restantes: number;
};

export function formatPriceBrl(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function mapTipo(type: ProductType): ProdutoEscola["tipo"] {
  return type === "COHORT" ? "cohort" : "legado";
}

function mapProduct(row: Product): ProdutoEscola {
  return {
    slug: row.slug,
    titulo: row.name,
    subtitulo: row.tagline ?? row.description.slice(0, 160),
    tipo: mapTipo(row.type),
    destaque: row.type === "COHORT",
    ticketLabel:
      row.priceCents > 0 ? formatPriceBrl(row.priceCents) : undefined,
    href: `/cursos/${row.slug}`,
  };
}

/** Produtos publicados no catálogo marketing (Prisma). */
export async function getPublishedCatalogProducts(): Promise<ProdutoEscola[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { publishStatus: "PUBLISHED", active: true },
      orderBy: [{ type: "asc" }, { updatedAt: "desc" }],
    });
    return rows.map(mapProduct);
  } catch {
    return [];
  }
}

/** Produto publicado por slug (somente vitrine pública).
 *  `cache()` deduplica a consulta entre generateMetadata e a página. */
export const getPublishedProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    try {
      return await prisma.product.findFirst({
        where: {
          slug,
          publishStatus: "PUBLISHED",
          active: true,
        },
      });
    } catch {
      return null;
    }
  },
);

/**
 * Produto do curso principal, distinguindo "despublicado" de "banco fora
 * do ar": com `dbDown` a landing usa o fallback estático em vez de sumir.
 */
export const getCursoPrincipal = cache(
  async (): Promise<{ product: Product | null; dbDown: boolean }> => {
    try {
      const product = await prisma.product.findFirst({
        where: {
          slug: CURSO_PRINCIPAL_SLUG,
          publishStatus: "PUBLISHED",
          active: true,
        },
      });
      return { product, dbDown: false };
    } catch {
      return { product: null, dbDown: true };
    }
  },
);

/** Verifica se o slug existe no catálogo (qualquer status). */
export const getCatalogProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    try {
      return await prisma.product.findUnique({ where: { slug } });
    } catch {
      return null;
    }
  },
);

/**
 * Vagas reais da turma fundadora: total fixo (selo) menos matrículas pagas
 * (orders com acesso liberado) do curso principal. Retorna `null` se o banco
 * estiver indisponível — a UI então omite o contador (sem gatilho falso).
 */
export const getCohortVagas = cache(async (): Promise<CohortVagas | null> => {
  try {
    const preenchidas = await prisma.order.count({
      where: {
        status: { in: [...ORDER_STATUSES_WITH_ACCESS] },
        product: { slug: CURSO_PRINCIPAL_SLUG },
      },
    });
    const restantes = Math.max(0, COHORT_VAGAS_TOTAL - preenchidas);
    return { total: COHORT_VAGAS_TOTAL, preenchidas, restantes };
  } catch {
    return null;
  }
});

/** Mescla DB + fallback estático (slugs únicos; campos do DB têm prioridade,
 *  mas campos curados que o DB não fornece — ex.: cargaHoraria — persistem). */
export async function getCatalogWithFallback(): Promise<{
  principal: ProdutoEscola[];
  legados: ProdutoEscola[];
  fromDatabase: boolean;
}> {
  const fromDb = await getPublishedCatalogProducts();
  const merged = new Map<string, ProdutoEscola>();

  for (const p of produtosEscola) merged.set(p.slug, p);
  for (const p of fromDb) {
    const curated = merged.get(p.slug);
    merged.set(p.slug, curated ? { ...curated, ...p } : p);
  }

  const all = [...merged.values()];
  return {
    principal: all.filter((p) => p.tipo === "cohort"),
    legados: all.filter((p) => p.tipo === "legado"),
    fromDatabase: fromDb.length > 0,
  };
}
