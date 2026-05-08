import type { Metadata } from "next";

import { CalculadoraCaseFile } from "@/components/marketing/calculadora/case-file";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Calculadora de Pena Hipotética",
  description:
    "Ferramenta gratuita que simula a aplicação trifásica da pena privativa de liberdade conforme o Código Penal brasileiro. Instrumento didático.",
  alternates: { canonical: "/calculadora-de-pena" },
};

/**
 * Calculadora de pena hipotética — Apêndice I do guia.
 *
 * Wizard de 3 etapas espelhando as fases da dosimetria.
 * Lógica DETERMINÍSTICA no backend (API Route).
 * Disclaimer institucional não-removível, renderizado no servidor.
 *
 * Esta página é placeholder — implementação completa em S3-S6 do roadmap.
 */
export default function CalculadoraPage() {
  const webAppLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `Calculadora de Pena Hipotética — ${siteConfig.name}`,
    description:
      "Ferramenta gratuita que simula a aplicação trifásica da pena privativa de liberdade conforme o Código Penal brasileiro. Instrumento didático para estudantes de concurso, advogados em formação e profissionais do Direito Penal.",
    url: `${siteConfig.url}/calculadora-de-pena`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    creator: {
      "@type": "Person",
      name: siteConfig.professor.fullName,
      jobTitle: siteConfig.professor.role,
      sameAs: [siteConfig.social.mpdft, siteConfig.social.linkedin],
    },
    publisher: { "@type": "Organization", name: siteConfig.name },
    isAccessibleForFree: true,
    inLanguage: "pt-BR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }}
      />
      <section className="relative z-10 mx-auto max-w-(--container-narrow) px-[5%] pt-32 pb-24 lg:px-12">
        <header className="max-w-3xl">
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
            Ferramenta interativa · Modo case file
          </p>
          <h1
            className="text-paper mt-6 font-serif leading-[1.1]"
            style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
          >
            Calculadora de <em className="text-amber italic">Pena</em>{" "}
            Hipotética
          </h1>
          <p className="text-paper-700 mt-7 text-lg leading-[1.7]">
            Simulação didática da aplicação trifásica da pena privativa de
            liberdade (CP, art. 68). Os parâmetros à esquerda; a sentença
            sendo redigida do lado direito, em tempo real.
          </p>
        </header>

        {/* Aviso slim — uma linha, não rouba a primeira dobra */}
        <aside
          role="note"
          className="border-amber/40 bg-amber/5 text-paper-800 mt-8 flex flex-wrap items-start gap-3 border-l-2 px-5 py-3 text-[13px] leading-relaxed"
        >
          <span className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
            Modo didático
          </span>
          <span className="flex-1">
            Instrumento de estudo. Não constitui parecer jurídico, não
            substitui consulta a advogado, não vincula a {siteConfig.name},
            o Prof. Flávio Milhomem em sua condição de Promotor de Justiça
            do MPDFT, nem o próprio MPDFT a qualquer resultado calculado.
          </span>
        </aside>

        <CalculadoraCaseFile />
      </section>
    </>
  );
}
