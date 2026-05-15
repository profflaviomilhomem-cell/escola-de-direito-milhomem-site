import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CareerJourneyPath } from "@/components/marketing/career-journey-path";
import { InstitutionalNotice } from "@/components/marketing/institutional-notice";
import { copy } from "@/config/copy";
import { siteConfig } from "@/config/site";
import { CAREER_JOURNEY_SPAN } from "@/data/career-journey";
import { obrasMilhomemCatalogo } from "@/data/obras-milhomem";

export const metadata: Metadata = {
  title: "Sobre Flávio Milhomem",
  description: copy.sobre.metaDescription,
  alternates: { canonical: "/sobre" },
};

const credentialHighlights = [
  {
    label: "Instituição",
    value: "MPDFT",
    hint: "Promotor de Justiça desde 1996",
  },
  {
    label: "Docência",
    value: "25 anos",
    hint: "Direito Penal e Processo Penal",
  },
  {
    label: "Formação",
    value: "Portugal e França",
    hint: "Universidade Católica Portuguesa · École Nationale de la Magistrature",
  },
] as const;

const sidebarStats = [
  {
    value: String(siteConfig.professor.careerYears),
    label: "Anos de prática jurídica",
  },
  {
    value: String(siteConfig.professor.teachingYears),
    label: "Anos de docência superior",
  },
  { value: "IV", label: "Obras jurídicas publicadas" },
] as const;

const sidebarLinks = [
  { href: siteConfig.social.linkedin, label: "LinkedIn" },
  { href: siteConfig.social.instagram, label: "Instagram" },
  { href: siteConfig.social.youtube, label: "YouTube" },
  { href: siteConfig.social.mpdft, label: "Portal MPDFT" },
] as const;

/**
 * Página Sobre: dupla função (autoridade do programa + biografia do cliente).
 * Hierarquia em secções, destaques escaneáveis e CTA para cursos.
 */
export default function SobrePage() {
  return (
    <article
      id="sobre-conteudo"
      className="px-gutter py-page mx-auto max-w-(--container-narrow) lg:px-12"
    >
      <header className="mb-10 max-w-4xl lg:mb-14">
        <p className="text-amber fm-mono">Sobre o professor</p>
        <h1
          className="mt-4 font-serif leading-[1.02]"
          style={{ fontSize: "clamp(44px, 5vw, 72px)" }}
        >
          Flávio <em className="text-amber italic">Milhomem</em>
        </h1>
        <p className="text-paper-700 mt-6 max-w-3xl text-lg leading-relaxed md:text-xl">
          {copy.sobre.introLead}
        </p>
        <p className="text-paper-700 mt-5 max-w-3xl text-lg leading-relaxed md:text-xl">
          {copy.sobre.introBody}
        </p>
      </header>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)] xl:gap-10">
        <aside className="mx-auto flex min-h-0 w-full max-w-lg flex-col gap-5 lg:sticky lg:top-28 lg:mx-0 lg:max-w-none">
          <figure className="m-0 shrink-0">
            <div className="border-amber/30 relative overflow-hidden border">
              <Image
                src="/images/professor/flavio-portrait.png"
                alt={`Retrato de ${siteConfig.professor.fullName}`}
                width={528}
                height={670}
                priority
                sizes="(max-width: 1024px) 100vw, 340px"
                unoptimized
                className="h-auto w-full object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-carbon/40 via-transparent to-transparent"
              />
            </div>
            <figcaption className="text-paper-600 fm-mono mt-3 text-sm leading-relaxed">
              {copy.sobre.portraitCaption}
            </figcaption>
          </figure>

          <div className="not-prose border-amber/25 from-paper/[0.02] flex flex-col gap-8 rounded-xl border bg-gradient-to-b to-transparent px-5 py-6 sm:px-6 sm:py-7">
            <div className="border-amber/30 space-y-5 border-l-2 pl-5">
              <p className="text-amber fm-mono text-xs font-medium uppercase tracking-[0.18em] sm:text-sm">
                Em números
              </p>
              <div className="space-y-5">
                {sidebarStats.map((row) => (
                  <div key={row.label}>
                    <p className="text-amber font-serif text-[clamp(2.35rem,7vw,3.5rem)] leading-none tracking-tight">
                      {row.value}
                    </p>
                    <p className="text-paper-600 mt-2 text-sm leading-relaxed sm:text-base">
                      {row.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <blockquote className="border-amber/20 bg-paper/[0.04] rounded-lg border py-4 pl-5 pr-4">
              <p className="text-paper-800 font-serif text-base italic leading-relaxed sm:text-[17px] sm:leading-[1.65]">
                {siteConfig.pvuShort}
              </p>
            </blockquote>

            <div>
              <p className="text-amber fm-mono text-xs font-medium uppercase tracking-[0.18em] sm:text-sm">
                Formação
              </p>
              <ul className="text-paper-700 mt-3 space-y-3 text-sm leading-relaxed sm:text-base sm:leading-relaxed">
                {siteConfig.professor.education.map((e) => (
                  <li key={e.institution}>
                    <span className="text-paper mb-0.5 block font-medium">
                      {e.institution}
                    </span>
                    <span className="text-paper-600">{e.program}</span>
                  </li>
                ))}
              </ul>
            </div>

            <nav
              aria-label="Presença online e institucional"
              className="border-paper-100/80 flex flex-col gap-3 border-t border-dashed pt-6"
            >
              <p className="text-amber fm-mono text-xs font-medium uppercase tracking-[0.18em] sm:text-sm">
                Ligações
              </p>
              {sidebarLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-paper-800 hover:text-amber fm-mono text-sm font-medium uppercase tracking-[0.12em] transition-colors sm:text-[15px]"
                >
                  {item.label} →
                </a>
              ))}
            </nav>
          </div>

          <CareerJourneyPath />
        </aside>

        <div className="prose-juridica flex min-w-0 w-full max-w-none flex-col gap-12">
          {/* — Credenciais (escaneável) — */}
          <section aria-labelledby="sobre-credenciais">
            <h2
              id="sobre-credenciais"
              className="text-paper fm-mono mb-6 text-[11px] uppercase tracking-[0.22em]"
            >
              Credenciais e atuação
            </h2>
            <p
              className="text-paper-800 leading-[1.65]"
              style={{ fontSize: "clamp(18px, 2.2vw, 20px)" }}
            >
              {copy.sobre.credentialsLead}
            </p>

            <dl className="not-prose mt-6 grid gap-4 sm:grid-cols-3 sm:items-start">
              {credentialHighlights.map((item) => (
                <div
                  key={item.label}
                  className="border-amber/15 bg-paper/[0.02] flex flex-col rounded-lg border px-4 py-3.5 sm:min-h-0 sm:py-4"
                >
                  <dt className="text-amber fm-mono text-[10px] uppercase tracking-[0.18em]">
                    {item.label}
                  </dt>
                  <dd className="text-paper mt-2 font-serif text-xl tracking-tight">
                    {item.value}
                  </dd>
                  <p className="text-paper-800 mt-2 text-[15px] font-medium leading-snug sm:text-base sm:leading-relaxed">
                    {item.hint}
                  </p>
                </div>
              ))}
            </dl>

            <section
              aria-labelledby="sobre-obras"
              className="not-prose mt-10 border-t border-paper-100 pt-10"
            >
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <h3
                  id="sobre-obras"
                  className="text-paper fm-mono text-[11px] uppercase tracking-[0.22em]"
                >
                  Obras em catálogo
                </h3>
                <span className="text-paper-600 max-w-md text-sm leading-relaxed">
                  Dois volumes da linha{" "}
                  <em className="text-paper not-italic">Objetivo</em> pela
                  Alumnus — fichas técnicas confirmadas em distribuidor nacional.
                </span>
              </div>

              <ul className="grid gap-5 sm:grid-cols-2">
                {obrasMilhomemCatalogo.map((obra) => (
                  <li
                    key={obra.isbn}
                    className="border-amber/20 bg-paper/[0.02] flex flex-col overflow-hidden rounded-lg border"
                  >
                    <div className="border-paper-100/40 bg-paper/[0.04] relative w-full overflow-hidden border-b">
                      <Image
                        src={obra.capaSrc}
                        alt={`Capa do livro «${obra.titulo}»`}
                        width={800}
                        height={1200}
                        sizes="(max-width: 640px) 96vw, (max-width: 1200px) 42vw, 360px"
                        quality={92}
                        className="block h-auto w-full"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className="text-amber fm-mono text-[10px] uppercase tracking-[0.16em]">
                        {obra.area}
                      </span>
                      <h3 className="text-paper mt-2 font-serif text-[clamp(1.05rem,2.5vw,1.35rem)] leading-snug tracking-tight">
                        {obra.titulo}
                      </h3>
                      <p className="text-paper-600 mt-3 flex-1 text-sm leading-relaxed">
                        {obra.sinopse}
                      </p>
                      <dl className="text-paper-700 mt-4 space-y-1.5 border-t border-paper-100/80 pt-4 text-[13px] leading-snug">
                        <div className="flex justify-between gap-3">
                          <dt className="text-paper-500">Editora</dt>
                          <dd>{obra.editora}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-paper-500">Edição</dt>
                          <dd className="text-right">{obra.edicaoAno}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-paper-500">Páginas</dt>
                          <dd>{obra.paginas}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-paper-500">ISBN</dt>
                          <dd className="font-mono text-[11px] tracking-tight">
                            {obra.isbn}
                          </dd>
                        </div>
                      </dl>
                      <a
                        href={obra.fichaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber fm-mono hover:text-paper mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] transition-colors"
                      >
                        Ficha no catálogo →
                      </a>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="text-paper-700 mt-8 leading-[1.75]">
                Há ainda publicações nas áreas de{" "}
                <strong className="text-paper font-medium">
                  Direito Penal Militar
                </strong>{" "}
                e{" "}
                <strong className="text-paper font-medium">
                  Processo Penal Militar
                </strong>
                , em <em>obras próprias e coletâneas</em> — a mesma lógica de
                preparação objetiva para provas e prática perante a Justiça
                Militar. Coordenador da{" "}
                <strong className="text-paper font-medium">
                  Revista Jurídica do MPDFT
                </strong>
                . No biênio 2025-2027 ocupa o cargo de{" "}
                <strong className="text-paper font-medium">
                  Ouvidor-Geral do MPDFT
                </strong>
                .
              </p>
            </section>
          </section>

          {/* — Trajetória (tempo) — */}
          <section aria-labelledby="sobre-trajetoria">
            <h2
              id="sobre-trajetoria"
              className="text-paper fm-mono mb-6 text-[11px] uppercase tracking-[0.22em]"
            >
              Trajetória em marcos
            </h2>
            <p className="text-paper-600 mb-2 max-w-prose text-sm leading-relaxed">
              A sequência completa ({CAREER_JOURNEY_SPAN.from}–{CAREER_JOURNEY_SPAN.to}) está na
              jornada animada — no desktop, no painel ao lado; no celular,{" "}
              <a href="#jornada-carreira" className="text-amber underline-offset-2 hover:underline">
                abra a animação
              </a>
              .
            </p>
          </section>

          {/* — Tese da Escola (destaque editorial) — */}
          <section aria-labelledby="sobre-escola">
            <h2
              id="sobre-escola"
              className="text-paper fm-mono mb-6 text-[11px] uppercase tracking-[0.22em]"
            >
              A Escola e o programa
            </h2>
            <blockquote className="border-amber/40 not-prose border-l-2 py-1 pl-6">
              <p className="text-paper-800 font-serif text-xl italic leading-snug md:text-2xl md:leading-snug">
                O conhecimento penal pelo ângulo da acusação não cabe em cursos
                generalistas: aqui o currículo gira em torno da{" "}
                <em className="text-amber not-italic">prática forense real</em>{" "}
                e da{" "}
                <em className="text-amber not-italic">jurisprudência viva</em> do
                STJ e STF.
              </p>
            </blockquote>
            <p className="text-paper-700 mt-6 leading-[1.75]">
              {copy.sobre.propostaClosing}
            </p>
          </section>

          <div className="not-prose border-amber/25 from-amber/[0.04] flex flex-col gap-4 rounded-lg border bg-gradient-to-br to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-paper font-serif text-lg md:text-xl">
                Ver módulos, datas e investimento
              </p>
              <p className="text-paper-600 mt-1 max-w-md text-sm leading-relaxed">
                A página de cursos liga esta biografia ao que de facto vai
                estudar na cohort.
              </p>
            </div>
            <Link
              href="/cursos"
              className="border-amber text-amber hover:bg-amber hover:text-paper fm-mono inline-flex shrink-0 items-center justify-center border px-5 py-3 text-center text-[13px] uppercase tracking-[0.18em] transition-colors"
            >
              Programa →
            </Link>
          </div>

          <InstitutionalNotice variant="full" className="not-prose max-w-none" />

          <aside className="border-paper-100/60 text-paper-600 rounded-md border border-dashed px-4 py-3 text-sm italic">
            Texto editorial em revisão pela mentoria estratégica. Versão final
            será publicada após o aval institucional.
          </aside>
        </div>
      </div>
    </article>
  );
}
