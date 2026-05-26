/** Slugs de checkout que apontam para produto publicado no banco. */
export const CHECKOUT_SLUG_ALIASES: Record<string, string> = {
  "edicao-lancamento": "prova-digital-no-processo-penal",
};

export function resolveCheckoutProductSlug(slug: string): string {
  return CHECKOUT_SLUG_ALIASES[slug] ?? slug;
}
