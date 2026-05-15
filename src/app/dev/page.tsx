import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * Painel dev — abrir site institucional, área do aluno e do professor.
 * Cada link define o cookie `fm_dev_role` antes de entrar na rota protegida.
 */
export default function DevLauncherPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const base = "";

  return (
    <main className="bg-carbon text-paper min-h-screen px-6 py-16">
      <div className="mx-auto max-w-lg">
        <p className="text-amber fm-mono text-[10px] uppercase tracking-[0.2em]">
          Desenvolvimento
        </p>
        <h1 className="mt-3 font-serif text-3xl">Abrir as três áreas</h1>
        <p className="text-paper-600 mt-4 text-sm leading-relaxed">
          O site institucional não precisa de login. Aluno e professor usam
          sessões mock por cookie — pode abrir cada uma num separador.
        </p>

        <ul className="mt-10 space-y-4">
          <li>
            <Link
              href="/"
              className="border-amber/40 hover:bg-amber/10 block rounded-lg border px-5 py-4 transition-colors"
            >
              <span className="text-amber fm-mono text-[10px] uppercase tracking-widest">
                1 · Institucional
              </span>
              <span className="mt-1 block text-lg">Home e marketing</span>
              <span className="text-paper-600 text-xs">/</span>
            </Link>
          </li>
          <li>
            <Link
              href={`${base}/dev/sessao?role=aluno&redirect=/aluno/dashboard`}
              className="border-amber/40 hover:bg-amber/10 block rounded-lg border px-5 py-4 transition-colors"
            >
              <span className="text-amber fm-mono text-[10px] uppercase tracking-widest">
                2 · Aluno
              </span>
              <span className="mt-1 block text-lg">Dashboard do aluno</span>
              <span className="text-paper-600 text-xs">/aluno/dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href={`${base}/dev/sessao?role=professor&redirect=/professor/dashboard`}
              className="border-amber/40 hover:bg-amber/10 block rounded-lg border px-5 py-4 transition-colors"
            >
              <span className="text-amber fm-mono text-[10px] uppercase tracking-widest">
                3 · Professor
              </span>
              <span className="mt-1 block text-lg">Painel do professor</span>
              <span className="text-paper-600 text-xs">/professor/dashboard</span>
            </Link>
          </li>
        </ul>

        <p className="text-paper-600 mt-10 text-xs">
          Alternativa: <code className="text-paper">NEXT_PUBLIC_DEV_FAKE_SESSION</code> no
          .env.local (uma role por vez, sem cookie).
        </p>
      </div>
    </main>
  );
}
