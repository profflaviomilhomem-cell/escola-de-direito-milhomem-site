import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contato",
  description: "Entre em contato com a Escola Flávio Milhomem.",
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  return (
    <section className="mx-auto max-w-prose px-gutter py-page">
      <h1 className="font-serif text-heading-1 text-tinta-700">Contato</h1>
      <p className="text-slate-700 mt-stack">
        Para dúvidas institucionais, parcerias acadêmicas e imprensa:
      </p>
      <ul className="mt-4 space-y-2 text-base">
        <li>
          E-mail:{" "}
          <a
            className="text-tinta-600 hover:underline"
            href={`mailto:${siteConfig.contact.email}`}
          >
            {siteConfig.contact.email}
          </a>
        </li>
        <li>
          Instagram:{" "}
          <a
            className="text-tinta-600 hover:underline"
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            {siteConfig.social.instagramHandle}
          </a>
        </li>
        <li>
          LinkedIn:{" "}
          <a
            className="text-tinta-600 hover:underline"
            href={siteConfig.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            Flávio Milhomem
          </a>
        </li>
      </ul>
      <p className="text-slate-500 mt-stack text-sm">
        Prazo de resposta: até 3 dias úteis.
      </p>
    </section>
  );
}
