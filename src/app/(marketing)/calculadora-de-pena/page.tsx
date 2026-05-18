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
      <section className="relative z-10 fm-site-page px-3 pt-20 pb-4 sm:px-4 md:pt-28 lg:pt-32 lg:pb-24">
        <h1 className="sr-only">Calculadora de Pena Hipotética</h1>
        <header className="hidden max-w-3xl lg:block">
          <p className="text-amber font-mono text-[9px] uppercase tracking-[0.18em] sm:text-[10px] sm:tracking-[0.2em]">
            Ferramenta interativa
          </p>
          <h1
            className="text-paper mt-3 font-serif leading-[1.08] sm:mt-6 sm:leading-[1.1]"
            style={{ fontSize: "clamp(30px, 7.5vw, 72px)" }}
          >
            Calculadora de <em className="text-amber italic">Pena</em>{" "}
            Hipotética
          </h1>
          <p className="text-paper-700 mt-4 text-[15px] leading-relaxed sm:mt-7 sm:text-lg sm:leading-[1.7]">
            Dosimetria trifásica didática (CP, art. 68). Ajuste o caso, veja a
            pena e a sentença em tempo real.
          </p>
        </header>

        <aside
          role="note"
          className="border-amber/40 bg-amber/5 text-paper-800 mt-5 hidden border-l-2 px-3 py-2.5 text-[12px] leading-snug sm:mt-8 sm:flex sm:flex-wrap sm:items-start sm:gap-3 sm:px-5 sm:py-3 sm:text-[13px] sm:leading-relaxed lg:flex"
        >
          <span className="text-amber font-mono text-[9px] uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.2em]">
            Didático
          </span>
          <span className="mt-1 block sm:mt-0 sm:flex-1">
            Não é parecer jurídico nem vincula {siteConfig.name}, o Prof.
            Flávio Milhomem (MPDFT) nem o MPDFT.
          </span>
        </aside>

        <CalculadoraCaseFile />
      </section>
    </>
  );
}
