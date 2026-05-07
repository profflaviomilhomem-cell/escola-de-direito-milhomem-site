import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade da Escola Flávio Milhomem em conformidade com a LGPD.",
  alternates: { canonical: "/privacidade" },
};

/**
 * Política de Privacidade (Seção 16 do guia).
 * LGPD-ready — placeholder; redação final pela assessoria jurídica.
 */
export default function PrivacidadePage() {
  return (
    <article className="mx-auto max-w-prose px-gutter py-page prose-juridica">
      <h1 className="font-serif text-heading-1 text-tinta-700">
        Política de Privacidade
      </h1>
      <p className="text-slate-500 mt-2 italic">
        Documento em construção · redação final pela assessoria jurídica.
      </p>
      <p className="mt-stack">
        Esta política descreve quais dados pessoais a {siteConfig.name} coleta,
        com qual finalidade, com qual base legal, e quais são os direitos do
        titular sob a Lei Geral de Proteção de Dados (Lei 13.709/2018).
      </p>
      <p className="mt-4">
        Para solicitações relacionadas a dados pessoais (acesso, correção,
        exclusão, portabilidade), entre em contato com o DPO em{" "}
        <a
          className="text-tinta-600 hover:underline"
          href={`mailto:${siteConfig.contact.privacyEmail}`}
        >
          {siteConfig.contact.privacyEmail}
        </a>
        . Resposta em até 15 dias.
      </p>
    </article>
  );
}
