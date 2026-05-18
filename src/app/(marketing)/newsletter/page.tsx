import type { Metadata } from "next";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { copy } from "@/config/copy";

const { newsletter } = copy;

export const metadata: Metadata = {
  title: `Newsletter — ${newsletter.eyebrow}`,
  description: newsletter.lead,
  alternates: { canonical: "/newsletter" },
};

/**
 * Página dedicada de captura (blueprint Seção 8.6).
 * Sem distração lateral. Promessa editorial clara.
 * Duplo opt-in obrigatório (LGPD).
 */
export default function NewsletterPage() {
  return (
    <section className="fm-site-page max-w-prose py-page">
      <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
        {newsletter.eyebrow}
      </p>
      <h1
        className="mt-3 font-serif leading-[1.05]"
        style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
      >
        {newsletter.title}{" "}
        <em className="text-amber italic">{newsletter.titleEmphasis}</em>.
      </h1>
      <p className="mt-stack leading-[1.7]">{newsletter.lead}</p>

      <NewsletterForm source="newsletter" />
    </section>
  );
}
