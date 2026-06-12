import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesso à área do aluno da Escola Flávio Milhomem.",
  alternates: { canonical: "/entrar" },
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ from?: string; unauthorized?: string }>;

/**
 * Tela de login standalone — caixa central translúcida sobre o backdrop
 * mesh + grid + noise herdado do `(auth)/layout.tsx`. Padrão "letterbox":
 * a caixa `bg-carbon/85` com `backdrop-blur` isola o formulário sem
 * cortar a atmosfera por trás.
 */
export default async function EntrarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const redirectTo =
    params.from && params.from.startsWith("/")
      ? params.from
      : "/aluno/dashboard";
  const showUnauthorized = params.unauthorized === "1";

  return (
    <div className="w-full max-w-[450px]">
      <div className="bg-carbon/85 border-paper-100 border p-8 shadow-2xl backdrop-blur-md md:p-12">
        <header className="mb-8">
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
            Área do aluno
          </p>
          <h1 className="mt-3 font-serif text-3xl leading-[1.1] md:text-4xl">
            Entrar.
          </h1>
        </header>

        {showUnauthorized && (
          <p
            role="status"
            className="border-amber/40 bg-amber/5 mb-6 border-l-2 px-4 py-3 text-sm leading-relaxed"
          >
            Sua sessão expirou ou você ainda não fez login. Entre para
            continuar.
          </p>
        )}

        <LoginForm redirectTo={redirectTo} />
      </div>

      <p className="text-paper-700 mt-8 text-center text-sm">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="text-paper hover:text-amber font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          Criar conta →
        </Link>
      </p>
    </div>
  );
}
