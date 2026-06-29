import { CURSO_PRINCIPAL_SLUG } from "@/data/produtos-escola";

/** Slugs de checkout que apontam para produto publicado no banco. */
export const CHECKOUT_SLUG_ALIASES: Record<string, string> = {
  "edicao-lancamento": CURSO_PRINCIPAL_SLUG,
};

export function resolveCheckoutProductSlug(slug: string): string {
  return CHECKOUT_SLUG_ALIASES[slug] ?? slug;
}
