import Image from "next/image";
import Link from "next/link";

import { InstitutionalNotice } from "@/components/marketing/institutional-notice";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { YoutubeEmbed } from "@/components/marketing/youtube-embed";
import { copy } from "@/config/copy";
import { siteConfig } from "@/config/site";
import { provaDigitalModulosPublicos } from "@/data/curso-prova-digital-publico";
import { CURSO_PRINCIPAL_SLUG } from "@/data/produtos-escola";
import type { CohortVagas } from "@/lib/marketing/catalog";
import type { FaqItem } from "@/lib/marketing/curso-faq";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

const PROFESSOR_PHOTO = "/images/professor/flavio-portrait.png";

type Props = {
  /** Preço real do produto (banco) — fallback estático quando offline. */
  priceLabel: string;
  /** FAQ com o preço interpolado (mesma lista do JSON-LD FAQPage). */
  faqItems: FaqItem[];
  /** Vagas reais da turma; `null` quando o banco está indisponível. */
  vagas?: CohortVagas | null;
};

/**
 * Landing Edição Lançamento — estrutura dos 14 blocos do Livro-Guia 6.5.
 */
export function EdicaoLancamentoLanding({
  priceLabel,
  faqItems,
  vagas,
}: Props) {
  const ed = copy.edicaoLancamento;
  const vagasLabel =
    vagas && vagas.restantes > 0
      ? `${vagas.restantes} de ${vagas.total} vagas restantes`
      : vagas && vagas.restantes === 0
        ? "Vagas esgotadas — entre na lista de espera"
        : null;

  return (
    <article className="fm-site-page py-page">
      {/* Bloco 1 */}
      <header className="max-w-3xl">
        <p className="text-amber fm-mono text-[11px] tracking-[0.22em] uppercase">
          {ed.eyebrow}
        </p>
        <h1
          className="fm-title-fluid mt-4 font-serif leading-[1.02]"
          style={fmTitleClamp("40px", "5vw", "64px")}
        >
          {ed.title} <em className="text-amber italic">{ed.titleEmphasis}</em>
        </h1>
        <p className="text-paper-700 mt-6 text-lg leading-relaxed">
          {ed.lead}{" "}
          <Link
            href="/sobre"
            className="text-amber underline-offset-2 hover:underline"
          >
            {ed.leadLinkLabel}
          </Link>
          .
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#investimento"
            className="bg-amber text-paper inline-block px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase"
          >
            {ed.ctaInvestimento}
          </a>
          <Link
            href="/newsletter?source=edicao-lancamento"
            className="border-amber text-amber border px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase"
          >
            {ed.ctaLista}
          </Link>
        </div>
        <p className="text-paper-500 mt-4 text-sm">{ed.videoNote}</p>
        <YoutubeEmbed
          videoId={siteConfig.social.edicaoLancamentoVideoId}
          title={ed.videoTitle}
          className="mt-10 max-w-2xl"
        />
      </header>

      {/* Bloco 2 */}
      <section className="mt-20" aria-labelledby="pilares-title">
        <h2
          id="pilares-title"
          className="text-paper fm-mono text-[11px] tracking-[0.22em] uppercase"
        >
          {ed.pilaresTitle}
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {ed.pilares.map((p) => (
            <li
              key={p.title}
              className="border-paper-100 bg-carbon-elevated/30 rounded-xl border p-5"
            >
              <h3 className="text-paper font-serif text-xl">{p.title}</h3>
              <p className="text-paper-600 mt-2 text-sm leading-relaxed">
                {p.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Bloco 3 — Sobre o professor */}
      <section
        className="mt-20 grid items-center gap-8 md:grid-cols-[200px_1fr]"
        aria-labelledby="sobre-prof-title"
      >
        <div className="border-paper-100 bg-carbon-elevated/30 relative mx-auto aspect-[3/4] w-40 overflow-hidden rounded-xl border md:mx-0 md:w-full">
          <Image
            src={PROFESSOR_PHOTO}
            alt={ed.sobrePhotoAlt}
            fill
            sizes="200px"
            className="object-cover object-top"
          />
        </div>
        <div>
          <h2 id="sobre-prof-title" className="font-serif text-3xl">
            {ed.sobreTitle}
          </h2>
          <div className="text-paper-700 mt-4 max-w-prose space-y-3 text-sm leading-relaxed">
            {ed.sobreParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Link
            href="/sobre"
            className="text-amber mt-5 inline-block font-mono text-[11px] tracking-[0.16em] uppercase underline-offset-2 hover:underline"
          >
            {ed.sobreCtaLabel} →
          </Link>
        </div>
      </section>

      {/* Blocos 4–5 */}
      <section className="mt-20" aria-labelledby="para-quem-title">
        <h2 id="para-quem-title" className="font-serif text-3xl">
          {ed.paraQuemTitle}
        </h2>
        <p className="text-paper-700 mt-4 max-w-prose leading-relaxed">
          {ed.paraQuemLead}
        </p>
        <p className="text-paper-600 mt-4 max-w-prose text-sm leading-relaxed">
          {ed.paraQuemSim} {ed.paraQuemNao}
        </p>
      </section>

      <section className="mt-16" aria-labelledby="ementa-title">
        <h2 id="ementa-title" className="scroll-mt-28 font-serif text-3xl">
          {ed.ementaTitle}
        </h2>
        <ol className="mt-8 space-y-6">
          {provaDigitalModulosPublicos.map((m) => (
            <li
              key={m.id}
              className="border-paper-100 rounded-lg border px-5 py-4"
            >
              <p className="text-amber font-mono text-[10px] tracking-[0.2em]">
                Módulo {m.id} — {m.title}
              </p>
              <p className="text-paper-600 mt-2 text-sm leading-relaxed">
                {m.desc}
              </p>
              <ul className="text-paper-700 mt-4 space-y-2 text-sm leading-relaxed">
                {m.lessons.map((aula) => (
                  <li key={aula.number}>
                    <span className="text-amber font-mono text-[10px]">
                      Aula {aula.number.toString().padStart(2, "0")}
                    </span>
                    {" — "}
                    {aula.title}
                  </li>
                ))}
              </ul>
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
        className="border-amber/30 bg-amber/[0.06] mt-20 scroll-mt-28 rounded-xl border p-8"
        aria-labelledby="investimento-title"
      >
        <h2 id="investimento-title" className="font-serif text-3xl">
          {ed.investimentoTitle}
        </h2>
        <p className="text-paper-700 mt-4 text-lg">
          <span className="text-paper font-serif text-4xl">{priceLabel}</span>
          {ed.investimentoPriceLead || ed.investimentoPriceInstallments ? (
            <>
              {" "}
              {ed.investimentoPriceLead}{" "}
              <span className="text-paper-800">
                {ed.investimentoPriceInstallments}
              </span>
            </>
          ) : null}
        </p>
        {ed.investimentoCheckoutNote ? (
          <p className="text-paper-600 mt-2 text-sm">
            {ed.investimentoCheckoutNote}
          </p>
        ) : null}
        <p className="text-amber mt-4 font-mono text-[10px] tracking-[0.2em] uppercase">
          {ed.investimentoSelo}
        </p>
        {vagasLabel ? (
          <p
            className="text-paper-700 mt-2 font-mono text-[11px] tracking-[0.12em] uppercase"
            aria-live="polite"
          >
            <span className="bg-amber mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle" />
            {vagasLabel}
          </p>
        ) : null}
        <p className="text-paper-600 mt-4 text-sm">{ed.investimentoGarantia}</p>
        <Link
          href={`/checkout/${CURSO_PRINCIPAL_SLUG}`}
          className="bg-amber text-paper mt-8 inline-block px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase"
        >
          {ed.investimentoCta}
        </Link>
      </section>

      {/* Bloco 12 */}
      <section
        id="faq"
        className="mt-16 scroll-mt-28"
        aria-labelledby="faq-title"
      >
        <h2 id="faq-title" className="font-serif text-3xl">
          {ed.faqTitle}
        </h2>
        <dl className="mt-8 space-y-6">
          {faqItems.map((item) => (
            <div key={item.q}>
              <dt className="text-paper font-medium">{item.q}</dt>
              <dd className="text-paper-600 mt-2 text-sm leading-relaxed">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Bloco 13 — Garantia risco zero */}
      <section
        className="border-paper-100 bg-carbon-elevated/30 mt-16 flex items-start gap-4 rounded-xl border p-6"
        aria-labelledby="garantia-title"
      >
        <span
          className="text-amber mt-0.5 shrink-0 font-serif text-3xl leading-none"
          aria-hidden
        >
          ⦿
        </span>
        <div>
          <h2 id="garantia-title" className="font-serif text-2xl">
            {ed.garantiaTitle}
          </h2>
          <p className="text-paper-600 mt-2 max-w-prose text-sm leading-relaxed">
            {ed.garantiaBody}
          </p>
        </div>
      </section>

      {/* Bloco 14 */}
      <section className="mt-16 text-center">
        <p className="font-serif text-2xl">{ed.fechamentoTitle}</p>
        <p className="text-paper-600 mt-2 text-sm">{ed.fechamentoNote}</p>
        {vagasLabel ? (
          <p className="text-amber mt-3 font-mono text-[11px] tracking-[0.16em] uppercase">
            {vagasLabel}
          </p>
        ) : null}
        <Link
          href="/newsletter?source=edicao-lancamento-rodape"
          className="border-amber text-amber mt-6 inline-block border px-8 py-3 font-mono text-[12px] tracking-[0.16em] uppercase"
        >
          {ed.fechamentoCta}
        </Link>
      </section>

      <InstitutionalNotice className="mx-auto mt-14 max-w-2xl" />
    </article>
  );
}
