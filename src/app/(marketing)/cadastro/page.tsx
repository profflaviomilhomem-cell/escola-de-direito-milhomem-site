import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar conta — Escola Flávio Milhomem",
  description:
    "Cadastro na Escola Flávio Milhomem — análise penal pelo ângulo da acusação.",
  alternates: { canonical: "/cadastro" },
  robots: { index: false, follow: false },
};

export default function CadastroPage() {
  return (
    <section className="mx-auto max-w-prose px-gutter py-page">
      <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
        Criar conta
      </p>
      <h1
        className="mt-3 font-serif leading-[1.05]"
        style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
      >
        Sua conta na <em className="text-amber italic">Escola</em>.
      </h1>
      <p className="mt-stack leading-[1.7]">
        Acesso ao boletim, à calculadora e — quando o cohort abrir — à área
        do aluno. Sem spam. Sem revenda de dado.
      </p>

      <RegisterForm />

      <p className="text-paper-700 mt-stack text-sm">
        Já tem conta?{" "}
        <Link
          href="/entrar"
          className="border-amber text-paper hover:text-amber border-b font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          Entrar →
        </Link>
      </p>
    </section>
  );
}
