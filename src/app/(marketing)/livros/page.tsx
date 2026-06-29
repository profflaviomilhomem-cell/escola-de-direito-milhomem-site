import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/config/site";
import { obrasMilhomemCatalogo } from "@/data/obras-milhomem";
import { bibliografiaLd, breadcrumbLd, personLd } from "@/lib/seo/jsonld";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Livros e publicações de Flávio Milhomem",
  description:
    "Bibliografia de Flávio Milhomem: obras de Direito Penal e Processo Penal com ficha verificável em catálogo — ISBN, editora e sinopse de cada título.",
  alternates: { canonical: "/livros" },
};

/**
 * Bibliografia do professor — página de citabilidade (guia 6.7 GEO, 7.2
 * E-E-A-T). Cada obra expõe ISBN + ficha de catálogo como credencial
 * externa verificável; schema `Book`/`ItemList` em `bibliografiaLd()`.
 */
export default function LivrosPage() {
  return (
    <section className="fm-site-page py-page">
      <JsonLd
        data={[
          personLd(),
          bibliografiaLd(),
          breadcrumbLd([
            { name: "Início", url: "/" },
            { name: "Livros", url: "/livros" },
          ]),
        ]}
      />

      <header className="mb-10 max-w-3xl md:mb-14">
        <p className="text-amber font-mono text-[11px] tracking-[0.2em] uppercase">
          Bibliografia · Obras em catálogo
        </p>
        <h1
          className="fm-title-fluid mt-4 font-serif leading-[1.02]"
          style={fmTitleClamp("48px", "6vw", "88px")}
        >
          Livros de <em className="text-amber italic">Flávio Milhomem</em>.
        </h1>
        <p className="text-paper-700 mt-6 text-base leading-relaxed md:text-lg">
          Obras de Direito Penal e Processo Penal adotadas em graduação e na
          preparação para concursos, com ficha verificável em catálogo comercial
          — ISBN, editora e edição de cada título. O professor também assina
          capítulos em obras coletivas da área criminal.
        </p>
      </header>

      <ul className="grid gap-8 md:grid-cols-2">
        {obrasMilhomemCatalogo.map((obra) => (
          <li
            key={obra.isbn}
            className="border-amber/20 bg-paper/[0.02] flex flex-col overflow-hidden rounded-lg border"
          >
            <div className="border-paper-100/40 bg-paper/[0.04] relative w-full overflow-hidden border-b">
              <Image
                src={obra.capaSrc}
                alt={`Capa do livro «${obra.titulo}»`}
                width={800}
                height={1200}
                sizes="(max-width: 640px) 96vw, (max-width: 1200px) 42vw, 460px"
                quality={92}
                className="block h-auto w-full"
              />
            </div>
            <div className="flex flex-1 flex-col p-5 md:p-6">
              <span className="text-amber fm-mono text-[10px] tracking-[0.16em] uppercase">
                {obra.area}
              </span>
              <h2 className="text-paper mt-2 font-serif text-[clamp(1.15rem,2.5vw,1.5rem)] leading-snug tracking-tight">
                {obra.titulo}
              </h2>
              <p className="text-paper-600 mt-3 flex-1 text-sm leading-relaxed">
                {obra.sinopse}
              </p>
              <dl className="text-paper-700 border-paper-100/80 mt-4 space-y-1.5 border-t pt-4 text-[13px] leading-snug">
                <div className="flex justify-between gap-3">
                  <dt className="text-paper-500">Editora</dt>
                  <dd>{obra.editora}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-paper-500">Edição</dt>
                  <dd className="text-right">{obra.edicaoAno}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-paper-500">Páginas</dt>
                  <dd>{obra.paginas}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-paper-500">ISBN</dt>
                  <dd className="font-mono text-[11px] tracking-tight">
                    {obra.isbn}
                  </dd>
                </div>
              </dl>
              <a
                href={obra.fichaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-amber text-amber hover:bg-amber hover:text-carbon fm-mono mt-5 inline-flex items-center justify-center gap-2 border px-4 py-2.5 text-[11px] tracking-[0.16em] uppercase transition-colors"
              >
                Ver ficha no catálogo ↗
              </a>
            </div>
          </li>
        ))}
      </ul>

      <aside className="border-amber/30 bg-amber/5 mt-16 flex flex-wrap items-center justify-between gap-6 border-l-2 px-6 py-8 md:px-10">
        <div>
          <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
            Sobre o autor
          </p>
          <h2 className="text-paper mt-2 font-serif text-2xl leading-tight">
            Trajetória, formação e credenciais de{" "}
            {siteConfig.professor.fullName}.
          </h2>
        </div>
        <Link
          href="/sobre"
          className="bg-amber text-carbon hover:bg-amber-soft inline-flex items-center gap-2 px-6 py-3 font-mono text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors"
        >
          Conhecer o professor →
        </Link>
      </aside>
    </section>
  );
}
