import Link from "next/link";

import { InstitutionalNotice } from "@/components/marketing/institutional-notice";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { copy } from "@/config/copy";
/**
 * Landing Edição Lançamento — estrutura dos 14 blocos do Livro-Guia 6.5.
 * Checkout Pagar.me entra quando a integração estiver ativa (bloco 11).
 */
export function EdicaoLancamentoLanding() {
  const { modules } = copy.home;
  const ed = copy.edicaoLancamento;

  return (
    <article className="fm-site-page py-page">
      {/* Bloco 1 */}
      <header className="max-w-3xl">
        <p className="text-amber fm-mono text-[11px] uppercase tracking-[0.22em]">
          {ed.eyebrow}
        </p>
        <h1
          className="mt-4 font-serif leading-[1.02]"
          style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
        >
          {ed.title}{" "}
          <em className="text-amber italic">{ed.titleEmphasis}</em>
        </h1>
        <p className="text-paper-700 mt-6 text-lg leading-relaxed">
          {ed.lead}{" "}
          <Link href="/sobre" className="text-amber underline-offset-2 hover:underline">
            {ed.leadLinkLabel}
          </Link>
          .
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#investimento"
            className="bg-amber text-paper inline-block px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em]"
          >
            {ed.ctaInvestimento}
          </a>
          <Link
            href="/newsletter?source=edicao-lancamento"
            className="border-amber text-amber border px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em]"
          >
            {ed.ctaLista}
          </Link>
        </div>
        <p className="text-paper-500 mt-4 text-sm">{ed.videoNote}</p>
        <div
          className="border-paper-100 mt-10 flex aspect-video max-w-2xl items-center justify-center rounded-lg border bg-carbon-elevated/40"
          aria-hidden
        >
          <p className="text-paper-500 font-mono text-[10px] uppercase tracking-[0.2em]">
            Vídeo em breve
          </p>
        </div>
      </header>

      {/* Bloco 2 */}
      <section className="mt-20" aria-labelledby="pilares-title">
        <h2 id="pilares-title" className="text-paper fm-mono text-[11px] uppercase tracking-[0.22em]">
          {ed.pilaresTitle}
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {ed.pilares.map((p) => (
            <li
              key={p.title}
              className="border-paper-100 rounded-xl border bg-carbon-elevated/30 p-5"
            >
              <h3 className="font-serif text-xl text-paper">{p.title}</h3>
              <p className="text-paper-600 mt-2 text-sm leading-relaxed">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Blocos 4–5 */}
      <section className="mt-20" aria-labelledby="para-quem-title">
        <h2 id="para-quem-title" className="font-serif text-3xl">
          {ed.paraQuemTitle}
        </h2>
        <p className="text-paper-700 mt-4 max-w-prose leading-relaxed">{ed.paraQuemLead}</p>
        <p className="text-paper-600 mt-4 max-w-prose text-sm leading-relaxed">
          {ed.paraQuemSim} {ed.paraQuemNao}
        </p>
      </section>

      <section className="mt-16" aria-labelledby="ementa-title">
        <h2 id="ementa-title" className="font-serif text-3xl">
          {ed.ementaTitle}
        </h2>
        <ol className="mt-8 space-y-4">
          {modules.map((m) => (
            <li
              key={m.id}
              className="border-paper-100 rounded-lg border px-5 py-4"
            >
              <p className="text-amber font-mono text-[10px] tracking-[0.2em]">
                Módulo {m.id}
              </p>
              <h3 className="mt-1 font-serif text-xl">{m.title}</h3>
              <p className="text-paper-600 mt-2 text-sm leading-relaxed">{m.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Blocos 6–7 */}
      <section className="mt-16 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">{ed.cronogramaTitle}</h2>
          <ul className="text-paper-700 mt-4 space-y-2 text-sm leading-relaxed">
            {ed.cronogramaItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-2xl">{ed.comoFuncionaTitle}</h2>
          <ul className="text-paper-700 mt-4 space-y-2 text-sm leading-relaxed">
            {ed.comoFuncionaItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-20" aria-labelledby="materiais-title">
        <h2 id="materiais-title" className="font-serif text-3xl">
          {ed.materiaisInclusosTitle}
        </h2>
        <ul className="text-paper-700 mt-6 grid gap-3 sm:grid-cols-2">
          {ed.materiaisInclusos.map((item) => (
            <li
              key={item}
              className="border-paper-100 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm leading-relaxed"
            >
              <span className="text-amber mt-0.5" aria-hidden>
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <TestimonialsSection variant="edicao" />

      {/* Bloco 11 */}
      <section
        id="investimento"
        className="border-amber/30 mt-20 scroll-mt-28 rounded-xl border bg-amber/[0.06] p-8"
        aria-labelledby="investimento-title"
      >
        <h2 id="investimento-title" className="font-serif text-3xl">
          {ed.investimentoTitle}
        </h2>
        <p className="text-paper-700 mt-4 text-lg">
          <span className="text-paper font-serif text-4xl">{ed.investimentoPriceMain}</span>{" "}
          {ed.investimentoPriceLead}{" "}
          <span className="text-paper-800">{ed.investimentoPriceInstallments}</span>
        </p>
        <p className="text-paper-600 mt-2 text-sm">{ed.investimentoCheckoutNote}</p>
        <p className="text-amber mt-4 font-mono text-[10px] uppercase tracking-[0.2em]">
          {ed.investimentoSelo}
        </p>
        <p className="text-paper-600 mt-4 text-sm">{ed.investimentoGarantia}</p>
        <Link
          href="/newsletter?source=edicao-lancamento-investimento"
          className="bg-amber text-paper mt-8 inline-block px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em]"
        >
          {ed.investimentoCta}
        </Link>
      </section>

      {/* Bloco 12 */}
      <section id="faq" className="mt-16 scroll-mt-28" aria-labelledby="faq-title">
        <h2 id="faq-title" className="font-serif text-3xl">
          {ed.faqTitle}
        </h2>
        <dl className="mt-8 space-y-6">
          {[...ed.faq, ...ed.faqExtra].map((item) => (
            <div key={item.q}>
              <dt className="text-paper font-medium">{item.q}</dt>
              <dd className="text-paper-600 mt-2 text-sm leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Bloco 14 */}
      <section className="mt-16 text-center">
        <p className="font-serif text-2xl">{ed.fechamentoTitle}</p>
        <p className="text-paper-600 mt-2 text-sm">{ed.fechamentoNote}</p>
        <Link
          href="/newsletter?source=edicao-lancamento-rodape"
          className="border-amber text-amber mt-6 inline-block border px-8 py-3 font-mono text-[12px] uppercase tracking-[0.16em]"
        >
          {ed.fechamentoCta}
        </Link>
      </section>

      <InstitutionalNotice className="mx-auto mt-14 max-w-2xl" />
    </article>
  );
}
