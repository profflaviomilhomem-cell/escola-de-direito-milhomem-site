"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  AreaMobileNav,
  type AreaNavLink,
} from "@/components/shared/area-mobile-nav";
import { BrandLogo } from "@/components/shared/brand-logo";
import { HeaderAccessibilityMenu } from "@/components/shared/header-accessibility-menu";

type Props = {
  homeHref: string;
  homeAriaLabel: string;
  navAriaLabel: string;
  links: AreaNavLink[];
  /** Conteúdo à direita (perfil, ações) — antes do menu mobile e acessibilidade. */
  trailing?: ReactNode;
  /** Links desktop mais compactos (ex.: professor com muitos itens). */
  compactNav?: boolean;
  /** Destaque no menu mobile (opcional). */
  mobileCta?: { href: string; label: string };
  /** Rota exata para considerar “Início/Painel” ativo. */
  exactMatchHref?: string;
};

/**
 * Header fixo das áreas logadas — mesma estrutura e tokens do `Header` institucional.
 */
export function AreaShellHeader({
  homeHref,
  homeAriaLabel,
  navAriaLabel,
  links,
  trailing,
  compactNav = false,
  mobileCta,
  exactMatchHref,
}: Props) {
  const pathname = usePathname();
  const exactHref = exactMatchHref ?? homeHref;

  const isActive = (href: string) =>
    href === exactHref ? pathname === href : pathname.startsWith(href);

  const navGap = compactNav
    ? "gap-3 lg:gap-4 xl:gap-5"
    : "gap-5 lg:gap-7";
  const linkSize = compactNav
    ? "text-[12px] lg:text-[13px]"
    : "text-[13px] lg:text-[14px]";

  return (
    <>
      <header className="fm-site-header fm-a11y-chrome bg-carbon/90 border-amber/10 fm-site-section fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md">
        <div className="fm-site-header__inner fm-site-container flex items-center justify-between gap-4 overflow-visible">
          <Link
            href={homeHref}
            className="fm-header-logo-slot shrink-0 text-inherit no-underline"
            aria-label={homeAriaLabel}
          >
            <BrandLogo variant="header" priority />
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 md:gap-6">
            <nav
              aria-label={navAriaLabel}
              className={`hidden min-w-0 items-center md:flex ${navGap}`}
            >
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 font-mono uppercase tracking-[0.18em] transition-colors ${linkSize} ${
                    isActive(item.href)
                      ? "text-paper"
                      : "text-paper-700 hover:text-paper"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {trailing}

            <AreaMobileNav
              links={links}
              ariaLabel={navAriaLabel}
              cta={mobileCta}
            />
            <HeaderAccessibilityMenu />
          </div>
        </div>
      </header>
      <div className="fm-site-header-spacer" aria-hidden />
    </>
  );
}
