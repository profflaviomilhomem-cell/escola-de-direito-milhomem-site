import Link from "next/link";
import type { ReactNode } from "react";

import { BackgroundLayers } from "@/components/marketing/animation/background-layers";
import { BrandLogo } from "@/components/shared/brand-logo";

/**
 * Layout dedicado das telas de autenticação (`/entrar`, `/cadastro`).
 *
 * Sem o header/footer institucional do `(marketing)` — o padrão
 * streaming exige tela cheia com brand mark sutil no canto superior,
 * caixa de formulário central translúcida sobre o backdrop atmosférico,
 * e footer reduzido com links institucionais essenciais.
 *
 * O backdrop (mesh gradient + grid amber + noise) vem do componente
 * `BackgroundLayers` global; aqui só estruturamos o contorno da página.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="text-paper relative flex min-h-screen flex-col overflow-hidden">
      <BackgroundLayers />

      {/* Brand mark canto superior esquerdo — sticky no topo, sem nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-14 md:py-8">
        <Link
          href="/"
          className="inline-flex items-center no-underline"
          aria-label="Escola Flávio Milhomem — voltar para a home"
        >
          <BrandLogo
            variant="stacked"
            className="fm-footer-logo--compact"
            priority
          />
        </Link>
        <Link
          href="/"
          className="text-paper-700 hover:text-paper font-mono text-[11px] tracking-[0.2em] uppercase transition-colors"
        >
          ← Voltar ao site
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 md:px-14">
        {children}
      </main>

      {/* Footer reduzido — links institucionais essenciais */}
      <footer className="relative z-10 px-6 py-10 md:px-14">
        <div className="border-paper-100 mx-auto max-w-[450px] border-t pt-6 md:max-w-2xl">
          <p className="text-paper-600 text-xs leading-relaxed">
            Esta página é protegida contra automação e fraude. Seus dados são
            tratados conforme a LGPD —{" "}
            <Link
              href="/privacidade"
              className="text-paper hover:text-amber underline-offset-2 hover:underline"
            >
              ver Política de Privacidade
            </Link>
            .
          </p>
          <ul className="text-paper-600 mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <li>
              <Link href="/contato" className="hover:text-paper">
                Suporte
              </Link>
            </li>
            <li>
              <Link href="/privacidade" className="hover:text-paper">
                Privacidade
              </Link>
            </li>
            <li>
              <Link href="/termos" className="hover:text-paper">
                Termos
              </Link>
            </li>
            <li>
              <Link href="/reembolso" className="hover:text-paper">
                Reembolso
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
