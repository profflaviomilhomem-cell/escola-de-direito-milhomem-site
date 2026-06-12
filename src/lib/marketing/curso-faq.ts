import { copy } from "@/config/copy";

export type FaqItem = { q: string; a: string };

/**
 * FAQ completo da landing do curso com o preço real interpolado —
 * fonte única para a UI e para o JSON-LD FAQPage.
 */
export function cursoFaqItems(priceLabel: string): FaqItem[] {
  return [...copy.edicaoLancamento.faq, ...copy.edicaoLancamento.faqExtra].map(
    (item) => ({ q: item.q, a: item.a.replaceAll("{preco}", priceLabel) }),
  );
}
