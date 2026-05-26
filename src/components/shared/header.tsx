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

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 md:gap-6">
            <nav
              aria-label="Navegação principal"
              className="hidden min-w-0 items-center gap-5 md:flex lg:gap-7"
            >
              {siteConfig.mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-paper-700 hover:text-paper font-mono text-[13px] uppercase tracking-[0.18em] transition-colors lg:text-[14px]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/newsletter"
                className="border-amber text-amber hover:bg-amber hover:text-paper shrink-0 border px-3 py-2 font-mono text-[12px] uppercase tracking-[0.16em] transition-colors lg:text-[13px]"
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
