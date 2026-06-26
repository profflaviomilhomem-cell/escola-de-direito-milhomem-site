import type { Metadata } from "next";

import { CalculadoraCaseFile } from "@/components/marketing/calculadora/case-file";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/config/site";
import {
  breadcrumbLd,
  PROFESSOR_ID,
  PROFESSOR_SAME_AS,
} from "@/lib/seo/jsonld";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

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
 * Lógica determinística em `lib/business/dosimetria.ts` (cliente).
 * Disclaimer institucional não-removível, renderizado no servidor.
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
      "@id": PROFESSOR_ID,
      name: siteConfig.professor.fullName,
      jobTitle: siteConfig.professor.role,
      url: `${siteConfig.url}/sobre`,
      sameAs: PROFESSOR_SAME_AS,
    },
    publisher: { "@type": "Organization", name: siteConfig.name },
    isAccessibleForFree: true,
    inLanguage: "pt-BR",
  };

  return (
    <>
      <JsonLd
        data={[
          webAppLd,
          breadcrumbLd([
            { name: "Início", url: "/" },
            { name: "Calculadora de Pena", url: "/calculadora-de-pena" },
          ]),
        ]}
      />
      <section className="fm-site-page relative z-10 px-3 pt-8 pb-8 sm:px-4 md:pt-10 lg:pt-12 lg:pb-16">
        <h1 className="sr-only">Calculadora de Pena Hipotética</h1>
        <header className="hidden max-w-3xl lg:block">
          <p className="text-amber font-mono text-[9px] tracking-[0.18em] uppercase sm:text-[10px] sm:tracking-[0.2em]">
            Ferramenta interativa
          </p>
          <h1
            className="fm-title-fluid text-paper mt-3 font-serif leading-[1.08] sm:mt-6 sm:leading-[1.1]"
            style={fmTitleClamp("30px", "7.5vw", "72px")}
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
          <span className="text-amber font-mono text-[9px] tracking-[0.16em] uppercase sm:text-[10px] sm:tracking-[0.2em]">
            Didático
          </span>
          <span className="mt-1 block sm:mt-0 sm:flex-1">
            Não é parecer jurídico nem vincula {siteConfig.name}, o Prof. Flávio
            Milhomem (MPDFT) nem o MPDFT.
          </span>
        </aside>

        <CalculadoraCaseFile />

        {/* Opt-in (LGPD, duplo opt-in via /api/leads · source=calculadora).
            Reusa o NewsletterForm; o lead é gravado com a origem da ferramenta. */}
        <aside className="border-paper-100 mx-auto mt-12 max-w-2xl border-t pt-10 sm:mt-16 sm:pt-12">
          <p className="text-amber font-mono text-[9px] tracking-[0.18em] uppercase sm:text-[10px] sm:tracking-[0.2em]">
            Vai além da calculadora
          </p>
          <h2
            className="text-paper mt-3 font-serif leading-[1.1]"
            style={fmTitleClamp("22px", "5vw", "34px")}
          >
            Receba análises de dosimetria{" "}
            <em className="text-amber italic">na perspectiva da acusação</em>
          </h2>
          <p className="text-paper-700 mt-3 text-[14px] leading-relaxed sm:text-[15px]">
            Casos comentados, leitura de precedentes e material de estudo direto
            no seu e-mail. Sem spam — confirmação dupla por LGPD.
          </p>
          <NewsletterForm source="calculadora" />
        </aside>
      </section>
    </>
  );
}
