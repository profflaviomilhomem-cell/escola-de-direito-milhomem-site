import type { Metadata } from "next";

import { mockProfessorAnnouncements } from "@/data/mock-professor";

export const metadata: Metadata = {
  title: "Anúncios — Painel do professor",
  robots: { index: false, follow: false },
};

/**
 * Anúncios institucionais publicados para o cohort. Esqueleto com a
 * lista renderizada; próxima iteração inclui editor inline, agendamento
 * de publicação, audiência segmentada por módulo, contagem de aberturas.
 */
export default function ProfessorAnunciosPage() {
  return (
    <section className="px-gutter mx-auto max-w-(--container-narrow) py-12 lg:px-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
            Comunicação institucional
          </p>
          <h1
            className="mt-3 font-serif leading-[1.05]"
            style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}
          >
            <em className="text-amber italic">Anúncios</em> publicados.
          </h1>
        </div>
        <button
          type="button"
          className="bg-amber text-carbon hover:bg-amber-soft inline-flex items-center gap-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Novo anúncio
        </button>
      </header>

      <ul className="space-y-4">
        {mockProfessorAnnouncements.map((a) => (
          <li
            key={a.id}
            className="border-paper-100 hover:border-amber bg-carbon-elevated border p-6 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
                  {new Date(a.publishedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="border-paper-200 text-paper-700 border px-2 py-[2px] font-mono text-[10px] uppercase tracking-[0.15em]">
                  {a.audience === "todos" ? "Todos" : a.audience}
                </span>
              </div>
              <span className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.15em]">
                {a.views} visualizações
              </span>
            </div>
            <h2 className="text-paper mt-3 font-serif text-xl leading-tight">
              {a.title}
            </h2>
            <p className="text-paper-700 mt-3 leading-relaxed">{a.body}</p>
            <div className="border-paper-100 mt-5 flex flex-wrap gap-3 border-t pt-4">
              <button
                type="button"
                className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
              >
                Editar
              </button>
              <button
                type="button"
                className="border-alerta-400/50 text-alerta-400 hover:bg-alerta-400/10 border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
              >
                Despublicar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
