import type { ReactNode } from "react";

/**
 * Layout editorial para páginas institucionais e legais
 * (Privacidade, Termos, Reembolso). Mesma família tipográfica das
 * outras páginas: eyebrow mono mostarda, h1 serif em clamp, divisor,
 * `Última atualização` e seções numeradas.
 *
 * O conteúdo é texto puro — passa em revisão jurídica antes de ir
 * pro ar. Cada `Section` tem `title` e `body`. Subitens podem ser
 * passados via `children` em vez de `body` quando o conteúdo for
 * mais rico (lista, tabela, etc.).
 */

export type LegalSection = {
  id: string;
  number: number;
  title: string;
  body?: ReactNode;
  children?: ReactNode;
};

type Props = {
  eyebrow: string;
  title: ReactNode;
  lastUpdated: string;
  draftNotice?: string;
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  lastUpdated,
  draftNotice,
  sections,
}: Props) {
  return (
    <article className="fm-site-page max-w-prose py-page">
      <header>
        <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
          {eyebrow}
        </p>
        <h1
          className="mt-3 font-serif leading-[1.05]"
          style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
        >
          {title}
        </h1>
        <p className="text-paper-600 mt-4 font-mono text-[11px] uppercase tracking-[0.2em]">
          Última atualização · {lastUpdated}
        </p>

        {draftNotice && (
          <p
            role="note"
            className="border-amber/40 bg-amber/5 text-paper-800 mt-stack border-l-2 px-5 py-4 text-base italic leading-[1.6]"
          >
            {draftNotice}
          </p>
        )}
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="mt-section scroll-mt-32"
        >
          <h2 className="font-serif text-3xl leading-[1.15]">
            <span className="text-amber font-mono text-base font-semibold tracking-[0.2em]">
              {String(section.number).padStart(2, "0")}
            </span>{" "}
            {section.title}
          </h2>
          {section.body && (
            <div className="mt-6 leading-[1.7]">{section.body}</div>
          )}
          {section.children && <div className="mt-6">{section.children}</div>}
        </section>
      ))}
    </article>
  );
}
