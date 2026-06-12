import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/shared/json-ld";
import { copy } from "@/config/copy";
import { breadcrumbLd, faqPageLd, organizationLd } from "@/lib/seo/jsonld";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "FAQ institucional",
  description:
    "Perguntas frequentes sobre a Escola Flávio Milhomem: o que é, quem é o professor, regime de magistério, cursos, certificado, reembolso e contato.",
  alternates: { canonical: "/faq" },
};

const RELATED_LINKS = [
  { href: "/sobre", label: "Sobre o professor" },
  { href: "/cursos", label: "Cursos e ementas" },
  { href: "/livros", label: "Bibliografia" },
  { href: "/reembolso", label: "Política de reembolso" },
  { href: "/contato", label: "Contato" },
] as const;

/**
 * FAQ institucional — página de citabilidade (guia Apêndice F.1, 6.7 AEO).
 * Conteúdo em `copy.faqInstitucional`; markup `FAQPage` espelha 1:1 a UI.
 */
export default function FaqPage() {
  const faq = copy.faqInstitucional;
  return (
    <section className="fm-site-page py-page">
      <JsonLd
        data={[
          faqPageLd(faq.items),
          organizationLd(),
          breadcrumbLd([
            { name: "Início", url: "/" },
            { name: "FAQ", url: "/faq" },
          ]),
        ]}
      />

      <header className="mb-10 max-w-3xl md:mb-14">
        <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
          {faq.eyebrow}
        </p>
        <h1
          className="fm-title-fluid mt-4 font-serif leading-[1.02]"
          style={fmTitleClamp("48px", "6vw", "88px")}
        >
          {faq.title} <em className="text-amber italic">{faq.titleEmphasis}</em>
          .
        </h1>
        <p className="text-paper-700 mt-6 text-base leading-relaxed md:text-lg">
          {faq.lead}
        </p>
      </header>

      <dl className="max-w-3xl space-y-4">
        {faq.items.map((item) => (
          <div
            key={item.q}
            className="border-paper-100 bg-carbon-elevated border p-6 md:p-8"
          >
            <dt className="text-paper font-serif text-xl leading-snug md:text-2xl">
              {item.q}
            </dt>
            <dd className="text-paper-700 mt-3 text-sm leading-relaxed md:text-base">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>

      <nav
        aria-label="Páginas relacionadas"
        className="border-paper-100 mt-14 max-w-3xl border-t pt-8"
      >
        <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
          Ver também
        </p>
        <ul className="mt-4 flex flex-wrap gap-3">
          {RELATED_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber fm-mono inline-block border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
