import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Layout dedicado das telas de autenticação (`/entrar`, `/cadastro`).
 *
 * Sem o header/footer institucional do `(marketing)` — o padrão
 * streaming exige tela cheia com brand mark sutil no canto superior
 * e backdrop atmosférico. Página filha controla seu próprio backdrop
 * (pode ser gradient, image, ou padrão).
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="bg-carbon text-paper relative min-h-screen overflow-hidden">
      {/* Atmosfera de fundo — radial mostarda + grid amber sutil + vinheta */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(221, 173, 12, 0.18), transparent 60%), radial-gradient(ellipse 80% 60% at 20% 80%, rgba(221, 173, 12, 0.08), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="fm-bg-grid pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(6, 23, 47, 0.7) 100%)",
        }}
      />

      {/* Brand mark canto superior esquerdo */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-14 md:py-8">
        <Link
          href="/"
          className="flex items-center gap-3 no-underline"
          aria-label="Escola Flávio Milhomem — voltar para a home"
        >
          <span className="border-amber text-amber grid h-10 w-10 place-items-center rounded-full border font-serif text-base italic">
            FM
          </span>
          <span className="hidden font-serif text-xl leading-none md:inline">
            Escola{" "}
            <em className="text-amber italic">Flávio Milhomem</em>
          </span>
        </Link>
      </header>

      <main className="relative z-10">{children}</main>

      {/* Footer reduzido — links institucionais essenciais */}
      <footer className="relative z-10 mt-auto px-6 py-10 md:px-14">
        <div className="border-paper-100 mx-auto max-w-[450px] border-t pt-6 md:max-w-2xl">
          <p className="text-paper-600 text-xs leading-relaxed">
            Esta página é protegida contra automação e fraude. Seus dados
            são tratados conforme a LGPD —{" "}
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
