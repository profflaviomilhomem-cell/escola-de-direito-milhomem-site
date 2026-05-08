import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar — Escola Flávio Milhomem",
  description: "Acesso à área do aluno da Escola Flávio Milhomem.",
  alternates: { canonical: "/entrar" },
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ from?: string; unauthorized?: string }>;

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const redirectTo =
    params.from && params.from.startsWith("/") ? params.from : "/aluno/dashboard";
  const showUnauthorized = params.unauthorized === "1";

  return (
    <section className="mx-auto max-w-prose px-gutter py-page">
      <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
        Área do aluno
      </p>
      <h1
        className="mt-3 font-serif leading-[1.05]"
        style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
      >
        Entrar na <em className="text-amber italic">Escola</em>.
      </h1>

      {showUnauthorized && (
        <p
          role="status"
          className="border-amber/40 bg-amber/5 mt-stack border-l-2 px-4 py-3 text-sm"
        >
          Sua sessão expirou ou você ainda não fez login. Entre para continuar.
        </p>
      )}

      <LoginForm redirectTo={redirectTo} />

      <p className="text-paper-700 mt-stack text-sm">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="border-amber text-paper hover:text-amber border-b font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          Criar conta →
        </Link>
      </p>
    </section>
  );
}
