import Link from "next/link";

import { HeaderAccessibilityMenu } from "@/components/shared/header-accessibility-menu";
import { siteConfig } from "@/config/site";

/**
 * Header institucional — nav do Livro-Guia 5.7 (máx. 5 itens) + CTA lista.
 */
export function Header() {
  return (
    <header className="bg-carbon/70 border-amber/10 fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b px-[5%] py-5 backdrop-blur-md">
      <Link
        href="/"
        className="flex min-w-0 shrink-0 items-center gap-3 text-inherit no-underline"
        aria-label={`${siteConfig.name} — início`}
      >
        <span className="border-amber text-amber grid h-11 w-11 shrink-0 place-items-center rounded-full border font-serif text-[20px] italic">
          FM
        </span>
        <span className="hidden font-serif text-[28px] leading-tight sm:inline">
          Flávio <em className="text-amber italic">Milhomem</em>
        </span>
      </Link>

      <div className="flex min-w-0 items-center justify-end gap-3 md:gap-6">
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

        <HeaderAccessibilityMenu />
      </div>
    </header>
  );
}
