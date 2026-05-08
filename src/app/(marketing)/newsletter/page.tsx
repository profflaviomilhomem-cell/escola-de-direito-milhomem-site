import type { Metadata } from "next";

import { NewsletterForm } from "@/components/marketing/newsletter-form";

export const metadata: Metadata = {
  title: "Newsletter — Bastidor da Acusação",
  description:
    "A cada quinze dias, análise dos informativos do STJ/STF em matéria penal pelo ângulo da acusação. Sem filler.",
  alternates: { canonical: "/newsletter" },
};

/**
 * Página dedicada de captura (blueprint Seção 8.6).
 * Sem distração lateral. Promessa editorial clara.
 * Duplo opt-in obrigatório (LGPD).
 */
export default function NewsletterPage() {
  return (
    <section className="mx-auto max-w-prose px-gutter py-page">
      <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
        Bastidor da Acusação
      </p>
      <h1
        className="mt-3 font-serif leading-[1.05]"
        style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
      >
        Boletim quinzenal pelo{" "}
        <em className="text-amber italic">ângulo da acusação</em>.
      </h1>
      <p className="mt-stack leading-[1.7]">
        Cada quinze dias, na sua caixa de entrada: análise comentada de
        informativos do STJ e STF em matéria penal, dica de leitura e o
        destaque da Escola. Sem filler. Sem spam.
      </p>

      <NewsletterForm source="newsletter" />
    </section>
  );
}
