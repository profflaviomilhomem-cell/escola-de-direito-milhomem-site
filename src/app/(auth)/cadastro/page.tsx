import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description:
    "Cadastro na Escola Flávio Milhomem — escola de direito criminal, perspectiva da acusação.",
  alternates: { canonical: "/cadastro" },
  robots: { index: false, follow: false },
};

/**
 * Tela de cadastro standalone — mesma anatomia de `/entrar`. Caixa
 * central translúcida sobre o backdrop atmosférico do `(auth)`.
 */
export default function CadastroPage() {
  return (
    <div className="w-full max-w-[450px]">
      <div className="bg-carbon/85 border-paper-100 border p-8 shadow-2xl backdrop-blur-md md:p-12">
        <header className="mb-8">
          <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
            Criar conta
          </p>
          <h1 className="mt-3 font-serif text-3xl leading-[1.1] md:text-4xl">
            Sua conta na <em className="text-amber italic">Escola</em>.
          </h1>
          <p className="text-paper-700 mt-3 text-sm leading-relaxed">
            Acesso ao boletim, à calculadora e — quando o cohort abrir — à área
            do aluno. Sem spam. Sem revenda de dado.
          </p>
        </header>

        <RegisterForm />
      </div>

      <p className="text-paper-700 mt-8 text-center text-sm">
        Já tem conta?{" "}
        <Link
          href="/entrar"
          className="text-paper hover:text-amber font-mono text-[11px] tracking-[0.2em] uppercase transition-colors"
        >
          Entrar →
        </Link>
      </p>
    </div>
  );
}
