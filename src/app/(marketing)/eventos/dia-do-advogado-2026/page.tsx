import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { copy } from "@/config/copy";

export const metadata: Metadata = {
  title: "Dia do Advogado 2026 · Abertura oficial da Escola",
  description: copy.evento.lead,
  alternates: { canonical: "/eventos/dia-do-advogado-2026" },
};

export default function EventoDiaAdvogadoPage() {
  const e = copy.evento;

  return (
    <article className="fm-site-page py-page">
      <header className="max-w-3xl">
        <p className="text-amber font-mono text-[11px] uppercase tracking-[0.22em]">
          {e.eyebrow}
        </p>
        <h1
          className="mt-4 font-serif leading-[1.02]"
          style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
        >
          {e.title}{" "}
          <em className="text-amber italic">{e.titleEmphasis}</em>
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
        className="border-amber/30 mt-16 rounded-xl border bg-amber/[0.06] p-8"
        aria-labelledby="rsvp-title"
      >
        <h2 id="rsvp-title" className="font-serif text-2xl">
          {e.rsvpTitle}
        </h2>
        <p className="text-paper-700 mt-3 text-sm leading-relaxed">{e.rsvpLead}</p>
        <div className="mt-6 max-w-md">
          <NewsletterForm source="evento-dia-advogado-2026" />
        </div>
        <p className="text-paper-500 mt-6 text-xs">
          Ao confirmar, você concorda em receber comunicações sobre o evento.{" "}
          <Link href="/privacidade" className="text-amber underline-offset-2 hover:underline">
            Privacidade
          </Link>
          .
        </p>
      </section>

      <p className="text-paper-600 mt-12 text-sm">
        <Link
          href="/cursos/edicao-lancamento"
          className="text-amber underline-offset-2 hover:underline"
        >
          Conheça a Edição Lançamento
        </Link>{" "}
        que será aberta no evento.
      </p>
    </article>
  );
}
