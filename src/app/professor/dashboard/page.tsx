import { useMemo } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  activeCourse,
  mockActivity,
  mockMetrics,
  mockProfessor,
  mockProfessorAnnouncements,
  pendingThreadsForProfessor,
} from "@/data/mock-professor";

export const metadata: Metadata = {
  title: "Painel do professor — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

const ACTIVITY_LABEL: Record<
  (typeof mockActivity)[number]["kind"],
  string
> = {
  comentario: "Fórum",
  "novo-aluno": "Matrícula",
  "aula-concluida": "Aula concluída",
  "anuncio-publicado": "Anúncio",
};

/**
 * Painel principal da área do professor — overview administrativa.
 *
 * Estrutura: hero saudação + 4 cards de métricas + bloco "Aguardando
 * sua resposta" (threads sem reply do professor) + atividade recente
 * + anúncios publicados + CTAs rápidas.
 */
export default function ProfessorDashboardPage() {
  const pending = pendingThreadsForProfessor();

  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), []);

  return (
    <>
      {/* Hero saudação */}
      <section className="px-gutter mx-auto max-w-(--container-narrow) pt-12 pb-8 lg:px-12">
        <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
          {mockProfessor.title}
        </p>
        <h1
          className="mt-3 font-serif leading-[1.05]"
          style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}
        >
          Bom dia,{" "}
          <em className="text-amber italic">
            {mockProfessor.name.split(" ")[0]}
          </em>
          .
        </h1>
        {pending.length > 0 ? (
          <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            Você tem{" "}
            <strong className="text-paper">
              {pending.length} pergunta{pending.length === 1 ? "" : "s"}
            </strong>{" "}
            aguardando sua resposta no fórum. SLA do cohort: 72h.
          </p>
        ) : (
          <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            Tudo em dia — nenhum tópico do fórum aguarda resposta sua agora.
          </p>
        )}

        {/* CTAs rápidas */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/professor/anuncios"
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
          </Link>
          <Link
            href="/professor/aulas"
            className="border-paper-200 text-paper hover:border-amber hover:text-amber inline-flex items-center gap-2 border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            Editar aulas
          </Link>
          <Link
            href={`/aluno/cursos/${activeCourse.slug}`}
            className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber inline-flex items-center gap-2 border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            Ver curso público
          </Link>
        </div>
      </section>

      {/* Métricas */}
      <section className="px-gutter mx-auto max-w-(--container-narrow) py-6 lg:px-12">
        <div className="border-paper-100 bg-carbon-elevated/60 grid grid-cols-2 gap-px border md:grid-cols-4">
          {mockMetrics.map((m) => (
            <div
              key={m.label}
              className="bg-carbon-elevated/40 p-6"
            >
              <p className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
                {m.label}
              </p>
              <p className="text-paper mt-3 font-serif text-3xl">{m.value}</p>
              {m.delta && (
                <p
                  className={`mt-2 font-mono text-[10px] uppercase tracking-[0.15em] ${
                    m.tone === "alert"
                      ? "text-alerta-400"
                      : m.tone === "positive"
                        ? "text-amber"
                        : "text-paper-700"
                  }`}
                >
                  {m.delta}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Aguardando sua resposta */}
      <section className="px-gutter mx-auto max-w-(--container-narrow) py-12 lg:px-12">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
              Fórum · Sem resposta sua
            </p>
            <h2 className="text-paper mt-2 font-serif text-2xl md:text-3xl">
              Aguardando palavra do professor
            </h2>
          </div>
          <Link
            href="/professor/forum"
            className="text-paper-700 hover:text-amber font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            Ver fórum completo →
          </Link>
        </header>

        {pending.length === 0 ? (
          <div className="border-paper-100 bg-carbon-elevated border p-10 text-center">
            <p className="text-paper-700 font-serif text-xl">
              Nada na fila — caixa zerada.
            </p>
          </div>
        ) : (
          <ul className="border-paper-100 bg-carbon-elevated divide-paper-100 divide-y border">
            {pending.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/professor/forum#${t.slug}`}
                  className="hover:bg-paper-100 group flex items-start gap-4 p-5 transition-colors md:items-center md:gap-6"
                >
                  <span className="bg-alerta-400/15 text-alerta-400 border-alerta-400/40 grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4" />
                      <path d="M12 16h.01" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.15em]">
                      {t.author.name} · há{" "}
                      {Math.max(
                        1,
                        Math.floor(
                          (now - new Date(t.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24),
                        ),
                      )}{" "}
                      dias
                    </p>
                    <p className="text-paper group-hover:text-amber mt-1 font-serif text-base leading-tight transition-colors md:text-lg">
                      {t.title}
                    </p>
                  </div>
                  <span className="text-paper-700 group-hover:text-amber hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] md:inline">
                    Responder →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Atividade recente + Anúncios em duas colunas */}
      <section className="px-gutter mx-auto max-w-(--container-narrow) grid gap-10 pb-20 lg:grid-cols-2 lg:px-12">
        {/* Atividade */}
        <div>
          <header className="mb-6">
            <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
              Movimento do cohort
            </p>
            <h2 className="text-paper mt-2 font-serif text-2xl">
              Atividade recente
            </h2>
          </header>
          <ul className="border-paper-100 bg-carbon-elevated divide-paper-100 divide-y border">
            {mockActivity.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-4 p-4"
              >
                <span className="bg-amber/10 text-amber border-amber/40 mt-0.5 flex-shrink-0 border px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.15em]">
                  {ACTIVITY_LABEL[a.kind]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-paper text-sm leading-relaxed">
                    <strong>{a.who}</strong> {a.detail}
                  </p>
                  <p className="text-paper-600 mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">
                    {a.when}
                  </p>
                </div>
                {a.href && (
                  <Link
                    href={a.href}
                    className="text-paper-700 hover:text-amber whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] self-center"
                  >
                    Abrir →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Anúncios */}
        <div>
          <header className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
                Comunicação
              </p>
              <h2 className="text-paper mt-2 font-serif text-2xl">
                Anúncios publicados
              </h2>
            </div>
            <Link
              href="/professor/anuncios"
              className="text-paper-700 hover:text-amber font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
            >
              Gerenciar →
            </Link>
          </header>
          <ul className="space-y-3">
            {mockProfessorAnnouncements.map((a) => (
              <li
                key={a.id}
                className="border-paper-100 hover:border-amber bg-carbon-elevated border p-5 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
                    {new Date(a.publishedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                    })}{" "}
                    · {a.audience === "todos" ? "Todos" : a.audience}
                  </span>
                  <span className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.15em]">
                    {a.views} visualizações
                  </span>
                </div>
                <h3 className="text-paper mt-2 font-serif text-lg leading-tight">
                  {a.title}
                </h3>
                <p className="text-paper-700 mt-2 line-clamp-2 text-sm leading-relaxed">
                  {a.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
