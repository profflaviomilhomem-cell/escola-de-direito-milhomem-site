import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter — Bastidor da Acusação",
  description:
    "A cada quinze dias, análise dos informativos do STJ/STF em matéria penal pelo ângulo da acusação. Sem filler.",
  alternates: { canonical: "/newsletter" },
};

/**
 * Página dedicada de captura (blueprint Seção 8.6).
 * Sem distração lateral, formulário simples, promessa editorial clara.
 * Duplo opt-in obrigatório (LGPD).
 */
export default function NewsletterPage() {
  return (
    <section className="mx-auto max-w-prose px-gutter py-page">
      <p className="text-overline text-dourado-600">Bastidor da Acusação</p>
      <h1 className="font-serif text-display-2 text-tinta-700 mt-3">
        Boletim quinzenal pelo ângulo da acusação
      </h1>
      <p className="text-slate-700 mt-stack">
        Cada quinze dias, na sua caixa de entrada: análise comentada de
        informativos do STJ e STF em matéria penal, dica de leitura,
        destaque da Escola. Sem filler. Sem spam.
      </p>
      <form
        action="/api/leads"
        method="post"
        className="mt-stack space-y-4"
        // TODO: integrar React Hook Form + Zod + duplo opt-in (Resend)
      >
        <label className="block">
          <span className="text-slate-700 text-sm font-medium">Seu e-mail</span>
          <input
            type="email"
            name="email"
            required
            className="border-border focus:border-tinta-600 mt-1 block w-full rounded-md border bg-white px-4 py-2 outline-none"
            placeholder="voce@exemplo.com"
          />
        </label>
        <button
          type="submit"
          className="bg-tinta-600 hover:bg-tinta-700 inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium text-white transition-colors"
        >
          Quero receber
        </button>
      </form>
      <p className="text-slate-500 mt-6 text-xs">
        Você receberá um e-mail de confirmação. Sem confirmação não há
        inscrição. Pode cancelar a qualquer momento.
      </p>
    </section>
  );
}
