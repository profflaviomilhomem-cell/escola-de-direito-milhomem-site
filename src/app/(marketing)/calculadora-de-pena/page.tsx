import type { Metadata } from "next";

import { CalculadoraWizard } from "@/components/marketing/calculadora/wizard";
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
      <section className="relative z-10 mx-auto max-w-3xl px-[5%] pt-32 pb-24">
        <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
          Ferramenta interativa
        </p>
        <h1
          className="text-paper mt-6 font-serif leading-[1.1]"
          style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
        >
          Calculadora de <em className="text-amber italic">Pena</em> Hipotética
        </h1>
        <p className="text-paper-700 mt-8 text-lg leading-[1.7]">
          Simulação didática da aplicação trifásica da pena privativa de
          liberdade (CP, art. 68): pena-base sob art. 59, pena intermediária
          com atenuantes/agravantes e pena definitiva com causas de aumento e
          diminuição.
        </p>

        <aside
          role="note"
          className="border-amber/40 bg-amber/5 text-paper-800 mt-10 border-l-2 p-5 text-sm italic leading-relaxed"
        >
          <strong className="text-amber not-italic">Aviso institucional —</strong>{" "}
          Esta calculadora é instrumento didático. A estimativa será simulação
          de aplicação trifásica da pena para fins de estudo, não constitui
          parecer jurídico, não substitui consulta a advogado, não opina sobre
          casos reais em juízo, e não vincula a {siteConfig.name}, o Prof.
          Flávio Milhomem em sua condição de Promotor de Justiça do MPDFT, nem
          o próprio MPDFT a qualquer resultado calculado.
        </aside>

        <CalculadoraWizard />
      </section>
    </>
  );
}
