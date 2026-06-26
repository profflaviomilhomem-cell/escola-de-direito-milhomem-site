import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/marketing/contact-form";
import { copy } from "@/config/copy";
import { siteConfig } from "@/config/site";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Contato",
  description: copy.contato.lead,
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  const c = copy.contato;

  return (
    <article className="fm-site-page py-page max-w-prose">
      <header>
        <p className="text-amber font-mono text-[11px] tracking-[0.2em] uppercase">
          {c.eyebrow}
        </p>
        <h1
          className="fm-title-fluid mt-3 font-serif leading-[1.05]"
          style={fmTitleClamp("40px", "5vw", "56px")}
        >
          {c.title}
        </h1>
        <p className="text-paper-700 mt-4 leading-relaxed">{c.lead}</p>
        <p className="text-paper-500 mt-4 text-sm">{c.responseNote}</p>
      </header>

      <section className="mt-12" aria-labelledby="contact-channels">
        <h2
          id="contact-channels"
          className="text-paper font-mono text-[11px] tracking-[0.2em] uppercase"
        >
          Canais diretos
        </h2>
        <ul className="text-paper-800 mt-4 space-y-2 text-base">
          <li>
            E-mail:{" "}
            <a
              className="text-amber underline-offset-2 hover:underline"
              href={`mailto:${siteConfig.contact.email}`}
            >
              {siteConfig.contact.email}
            </a>
          </li>
          <li>
            Instagram:{" "}
            <a
              className="text-amber underline-offset-2 hover:underline"
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              {siteConfig.social.instagramHandle}
            </a>
          </li>
          <li>
            LinkedIn:{" "}
            <Link
              className="text-amber underline-offset-2 hover:underline"
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              Flávio Milhomem
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="contact-form-title">
        <h2 id="contact-form-title" className="font-serif text-2xl">
          {c.formTitle}
        </h2>
        <ContactForm />
      </section>
    </article>
  );
}
