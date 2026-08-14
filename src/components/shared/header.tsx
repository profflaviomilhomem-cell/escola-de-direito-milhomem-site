import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";
import { HeaderAccessibilityMenu } from "@/components/shared/header-accessibility-menu";
import { HeaderMobileNav } from "@/components/shared/header-mobile-nav";
import { siteConfig } from "@/config/site";

/**
 * Header institucional — fixo no topo; logo em círculo que avança sobre a borda inferior.
 * O espaçador reserva altura no fluxo para o conteúdo não ficar sob o header.
 */
export function Header() {
  return (
    <>
      <header className="fm-site-header fm-a11y-chrome bg-carbon/90 border-amber/10 fm-site-section fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md">
        <div className="fm-site-header__inner fm-site-container flex items-center justify-between gap-4 overflow-visible">
          <Link
            href="/"
            className="fm-header-logo-slot shrink-0 text-inherit no-underline"
            aria-label={`${siteConfig.name} — início`}
          >
            <BrandLogo variant="header" priority />
          </Link>

          {/*
            14/08/2026 — a nav se sobrepunha ao botão de acessibilidade.
            Causa medida, não suposta: com `min-w-0` o flex espremia a nav
            abaixo do próprio conteúdo (precisava de 643px, recebia 502px) e o
            CTA "Entre na lista" vazava por cima do vizinho. Duas correções:

            1. `shrink-0` no lugar de `min-w-0` — a nav nunca mais é espremida
               abaixo do que ela ocupa, então não existe vazamento silencioso.
            2. Breakpoint em `xl`, não em `md`. A soma é aritmética: logo 260px
               + nav 643px + menu de acessibilidade 162px + folgas ≈ 1150px.
               Em `md` (768px) nunca coube; em `lg` (1024px) ainda colidia,
               medido. Abaixo de 1280px vale o menu completo em tela cheia.

            A correção durável é outra e não é minha: seis links no topo de uma
            página de venda disputam com o botão de compra. O concorrente direto
            medido em 13/08 tem ZERO links no header.
          */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 xl:gap-5">
            <nav
              aria-label="Navegação principal"
              className="hidden shrink-0 items-center gap-4 xl:flex xl:gap-6"
            >
              {siteConfig.mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-paper-700 hover:text-paper font-mono text-[13px] tracking-[0.18em] uppercase transition-colors lg:text-[14px]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/newsletter"
                className="border-amber text-amber hover:bg-amber hover:text-carbon shrink-0 border px-3 py-2 font-mono text-[12px] tracking-[0.16em] uppercase transition-colors lg:text-[13px]"
              >
                Entre na lista
              </Link>
            </nav>

            <HeaderMobileNav />
            <HeaderAccessibilityMenu />
          </div>
        </div>
      </header>
      <div className="fm-site-header-spacer" aria-hidden />
    </>
  );
}
