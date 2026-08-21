import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { copy } from "@/config/copy";
import { CURSO_PRINCIPAL_PATH } from "@/data/produtos-escola";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

/**
 * Evento de abertura da Escola — data a confirmar.
 *
 * Em 06/08/2026 esta página virou "registro" do evento de 11/08. Em 21/08/2026
 * ficou claro que o evento NÃO aconteceu (lançamento adiado), então ela volta
 * a ser aviso: sem data, sem "Confirmar presença", com captura de lead para
 * avisar a nova data. O slug continua o antigo porque está indexado e no
 * sitemap; quando o evento novo tiver nome e data, criar a página nova e
 * redirecionar este caminho em `next.config.ts`.
 *
 * O texto vive em `copy.evento`.
 */
export const metadata: Metadata = {
  title: "Evento de abertura da Escola · nova data em breve",
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
        — a nova data das inscrições da Edição Lançamento será anunciada em
        breve para quem está na lista.
      </p>
    </article>
  );
}
