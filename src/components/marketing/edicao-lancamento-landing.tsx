import Image from "next/image";
import Link from "next/link";

import { CadeiaCustodiaInterativa } from "@/components/marketing/cadeia-custodia-interativa";
import { InstitutionalNotice } from "@/components/marketing/institutional-notice";
import { StickyOfertaBar } from "@/components/marketing/sticky-oferta-bar";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { YoutubeEmbed } from "@/components/marketing/youtube-embed";
import { copy } from "@/config/copy";
import { siteConfig } from "@/config/site";
import { provaDigitalModulosPublicos } from "@/data/curso-prova-digital-publico";
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
  // 13/08/2026 — o contador só entra quando já existe aluno matriculado.
  // `getCohortVagas()` conta pedidos reais e o banco tem 1 pedido: no dia 17 a
  // página anunciaria "49 de 50 vagas restantes", que é honesto e é exatamente
  // a frase "ninguém comprou isto" em destaque. Enquanto não houver matrícula,
  // a escassez fica por conta do selo ("Turma fundadora · até 50 alunos"), que
  // é verdadeiro e não exibe placar. Quando as vagas começarem a sair, o
  // contador volta sozinho e aí ele joga a favor.
  const vagasLabel =
    vagas && vagas.restantes > 0 && vagas.preenchidas > 0
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
            className="bg-amber text-carbon inline-block px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase"
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

      {/* Barra de oferta fixa — some enquanto #investimento está na tela. */}
      {/* 24/08/2026: a barra tem UM destino só, e ele é o mesmo do CTA de
          investimento. Com as inscrições suspensas (adiamento), esse destino é a
          lista — não o checkout, que responde "pagamento indisponível".
          Voltar para `/checkout/<CURSO_PRINCIPAL_SLUG>` quando vendas abrirem,
          junto com o CTA do bloco de investimento. */}
      <StickyOfertaBar
        priceLabel={priceLabel}
        href="/newsletter?source=edicao-lancamento-barra"
        cta={ed.investimentoCta}
        note={ed.barraOfertaNote}
      />

      {/*
        Faixa de números — 13/08/2026.
        As cinco landings do benchmark abrem com números medidos antes de
        qualquer argumento (o Ênfase põe quatro logo abaixo do herói). Nós
        tínhamos os dados e não os mostrávamos. Cada valor aqui é medido:
        ver o comentário de `numeros` em `copy.ts`.
      */}
      <section
        className="border-paper-100 mt-14 border-y py-6"
        aria-label="O curso em números"
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
          {ed.numeros.map((n) => (
            <div key={n.label}>
              <dt className="sr-only">{n.label}</dt>
              <dd>
                <span className="text-paper block font-serif text-4xl leading-none tabular-nums">
                  {n.valor}
                </span>
                <span
                  className="text-paper-600 mt-2 block font-mono text-[10px] leading-snug tracking-[0.14em] uppercase"
                  aria-hidden
                >
                  {n.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/*
        Índice de âncoras — 13/08/2026. `sticky` puro, sem JS: o leitor cético
        não lê em ordem, vai direto à ementa e ao preço. Insper e Maven fazem
        igual logo abaixo do título.
      */}
      <nav
        aria-label="Seções desta página"
        className="border-paper-100 bg-carbon/95 sticky top-0 z-30 -mx-4 mt-0 border-b px-4 backdrop-blur-sm"
      >
        <ul className="flex gap-5 overflow-x-auto py-3">
          {ed.navItems.map((item) => (
            <li key={item.href} className="shrink-0">
              <a
                href={item.href}
                className="text-paper-700 hover:text-amber focus-visible:outline-amber font-mono text-[11px] tracking-[0.16em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/*
        Bloco "o problema" — 13/08/2026. A página abria em modo catálogo ("O
        curso da Edição Lançamento da Escola…"). Nenhuma das cinco referências
        faz isso: todas nomeiam a dor antes de apresentar o produto.
      */}
      <section className="mt-20 max-w-3xl" aria-labelledby="problema-title">
        <p className="text-amber fm-mono text-[11px] tracking-[0.22em] uppercase">
          {ed.problemaEyebrow}
        </p>
        <h2
          id="problema-title"
          className="text-paper mt-4 font-serif text-3xl leading-tight md:text-4xl"
        >
          {ed.problemaTitle}
        </h2>
        <p className="text-paper-700 mt-5 text-lg leading-relaxed">
          {ed.problemaBody}
        </p>
      </section>

      {/*
        Demonstração — entra logo depois da dor, como resposta a ela.
        Ocupa o lugar da prova social: a lista de depoimentos está vazia até a
        turma estrear, e demonstração é o substituto honesto de um depoimento
        que não existe.
      */}
      <CadeiaCustodiaInterativa />

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
          <h2
            id="sobre-prof-title"
            className="scroll-mt-28 font-serif text-3xl"
          >
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
        {/*
          13/08/2026 — as duas frases viraram duas colunas. Dizer para quem NÃO
          é sobe a conversão de quem é e derruba pedido de reembolso; e o leitor
          aqui é advogado, que procura a cláusula escondida. Sem afirmação nova:
          cada item é um pedaço do texto que já estava publicado.
        */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="border-amber/30 bg-amber/[0.06] rounded-xl border p-6">
            <h3 className="text-amber font-mono text-[11px] tracking-[0.18em] uppercase">
              {ed.paraQuemSimTitle}
            </h3>
            <ul className="text-paper-700 mt-4 space-y-3 text-sm leading-relaxed">
              {ed.paraQuemSimItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-amber shrink-0" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-paper-100 rounded-xl border p-6">
            <h3 className="text-paper-600 font-mono text-[11px] tracking-[0.18em] uppercase">
              {ed.paraQuemNaoTitle}
            </h3>
            <ul className="text-paper-600 mt-4 space-y-3 text-sm leading-relaxed">
              {ed.paraQuemNaoItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-paper-400 shrink-0" aria-hidden>
                    ×
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
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
          <h2
            id="como-funciona-title"
            className="scroll-mt-28 font-serif text-2xl"
          >
            {ed.comoFuncionaTitle}
          </h2>
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
        {/* 21/08/2026: inscrições suspensas (lançamento adiado) — o CTA do
            investimento vai para a lista de espera, não para o checkout.
            Voltar para `/checkout/<CURSO_PRINCIPAL_SLUG>` quando vendas abrirem. */}
        <Link
          href="/newsletter?source=edicao-lancamento-investimento"
          className="bg-amber text-carbon mt-8 inline-block px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase"
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
