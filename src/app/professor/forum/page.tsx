import type { Metadata } from "next";
import Link from "next/link";

import {
  answeredThreadsForProfessor,
  pendingThreadsForProfessor,
} from "@/data/mock-professor";

export const metadata: Metadata = {
  title: "Fórum — Painel do professor",
  robots: { index: false, follow: false },
};

/**
 * Fórum administrativo — placeholder navegável.
 * Próxima iteração: réplica do fórum do aluno mas com priorização de
 * threads sem resposta + ferramentas de moderação inline.
 */
export default function ProfessorForumPage() {
  const pending = pendingThreadsForProfessor();
  const answered = answeredThreadsForProfessor();

  return (
    <section className="fm-site-page py-12">
      <header className="mb-10">
        <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
          Fórum · administrativo
        </p>
        <h1
          className="mt-3 font-serif leading-[1.05]"
          style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}
        >
          Conversas do{" "}
          <em className="text-amber italic">cohort</em>.
        </h1>
        <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
          {pending.length === 0
            ? "Caixa zerada. Nenhuma thread aguarda resposta sua agora."
            : `${pending.length} pergunta${pending.length === 1 ? "" : "s"} aguardam sua palavra. Próxima iteração: ferramentas de moderação inline (fixar, ocultar, marcar como resolvido).`}
        </p>
      </header>

      <div className="border-paper-100 bg-carbon-elevated/40 border p-10 text-center">
        <p className="text-paper-700 font-serif text-xl">
          Fórum administrativo em breve.
        </p>
        <p className="text-paper-600 mx-auto mt-4 max-w-md text-sm leading-relaxed">
          Por enquanto, use o{" "}
          <Link
            href="/aluno/forum"
            className="text-amber hover:underline"
          >
            fórum do aluno
          </Link>{" "}
          (mesmo conteúdo, com sua perspectiva de professor automática).{" "}
          {pending.length} aguardando · {answered.length} respondidas.
        </p>
      </div>
    </section>
  );
}
