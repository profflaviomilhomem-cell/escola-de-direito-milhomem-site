import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dia do Advogado 2026 · Abertura oficial da Escola",
  description:
    "11 de agosto de 2026, em Brasília. Painel de Direito Penal contemporâneo, aula inaugural e abertura oficial da Edição Lançamento.",
  alternates: { canonical: "/eventos/dia-do-advogado-2026" },
};

/**
 * Landing do evento-âncora (Cap 7.7 do livro-guia).
 * Inscrição gratuita com captura de e-mail.
 * Lista de presença vira segmento alto-valor.
 */
export default function EventoDiaAdvogadoPage() {
  return (
    <section className="mx-auto max-w-(--container-narrow) px-gutter py-page">
      <p className="text-overline text-dourado-600">11 · ago · 2026</p>
      <h1 className="font-serif text-display-1 text-tinta-700 mt-3">
        Dia do Advogado · Abertura oficial em Brasília
      </h1>
      <p className="text-slate-700 mt-stack max-w-2xl text-body-lg">
        Painel sobre Direito Penal contemporâneo, aula inaugural de Flávio
        Milhomem e abertura formal das inscrições da Edição Lançamento da
        Escola. Vagas presenciais limitadas. Transmissão online aberta.
      </p>
      <p className="text-slate-500 mt-6 text-sm italic">
        Página em construção · landing detalhada chega em junho.
      </p>
    </section>
  );
}
