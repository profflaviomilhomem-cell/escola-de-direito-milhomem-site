import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { copy } from "@/config/copy";
import { CURSO_PRINCIPAL_PATH } from "@/data/produtos-escola";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

/**
 * Registro do evento de abertura da Escola (11/08/2026, Brasília).
 *
 * Em 06/08/2026 esta página deixou de ser convite e virou registro: o evento
 * ocorre em 11/08 e o site entra no ar em 17/08, então todo visitante chega
 * depois. Ela está no `sitemap.ts`, logo é indexada — e um "Confirmar
 * presença" para evento vencido é a primeira impressão errada para o público
 * de advogados que a Escola quer.
 *
 * O texto vive em `copy.evento`. A captura de lead continua, com a promessa
 * trocada de vaga para material da aula inaugural.
 */
export const metadata: Metadata = {
  title: "Dia do Advogado 2026 · A abertura da Escola",
  description: copy.evento.lead,
  alternates: { canonical: "/eventos/dia-do-advogado-2026-brasilia" },
};

export default function EventoDiaAdvogadoPage() {
  const e = copy.evento;

  return (
    <article className="fm-site-page py-page">
      <header className="max-w-3xl">
        <p className="text-amber font-mono text-[11px] tracking-[0.22em] uppercase">
          {e.eyebrow}
        </p>
        <h1
          className="fm-title-fluid mt-4 font-serif leading-[1.02]"
          style={fmTitleClamp("40px", "5vw", "64px")}
        >
          {e.title} <em className="text-amber italic">{e.titleEmphasis}</em>
        </h1>
        <p className="text-paper-700 mt-6 text-lg leading-relaxed">{e.lead}</p>
      </header>

      <section className="mt-16" aria-labelledby="agenda-title">
        <h2 id="agenda-title" className="font-serif text-2xl">
          {e.agendaTitle}
        </h2>
        <ol className="text-paper-700 mt-6 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {e.agenda.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section
        className="border-amber/30 bg-amber/[0.06] mt-16 rounded-xl border p-8"
        aria-labelledby="rsvp-title"
      >
        <h2 id="rsvp-title" className="font-serif text-2xl">
          {e.rsvpTitle}
        </h2>
        <p className="text-paper-700 mt-3 text-sm leading-relaxed">
          {e.rsvpLead}
        </p>
        <div className="mt-6 max-w-md">
          <NewsletterForm source="evento-dia-advogado-2026" />
        </div>
        <p className="text-paper-500 mt-6 text-xs">
          Ao se registrar, você concorda em receber comunicações da Escola.{" "}
          <Link
            href="/privacidade"
            className="text-amber underline-offset-2 hover:underline"
          >
            Privacidade
          </Link>
          .
        </p>
      </section>

      <p className="text-paper-600 mt-12 text-sm">
        <Link
          href={CURSO_PRINCIPAL_PATH}
          className="text-amber underline-offset-2 hover:underline"
        >
          Conheça o curso Prova Digital no Processo Penal
        </Link>{" "}
        — as inscrições da Edição Lançamento estão abertas, e a turma começa em
        1º de setembro de 2026.
      </p>
    </article>
  );
}
