import Link from "next/link";

import { HeaderAccessibilityMenu } from "@/components/shared/header-accessibility-menu";

/**
 * Header institucional dark — absorvido do mockup oficial.
 * Brand mark circular "FM" + nav uppercase mono + CTA Cohort destacado.
 * Fixed top com backdrop-blur sobre as camadas de grid/noise.
 */
const navItems = [
  { label: "Home", href: "/" },
  { label: "Manifesto", href: "/sobre" },
  { label: "Programa", href: "/cursos" },
  { label: "Blog", href: "/blog" },
  { label: "Calculadora", href: "/calculadora-de-pena" },
  { label: "Professor", href: "/sobre" },
  { label: "FAQ", href: "/contato" },
];

export function Header() {
  return (
    <header className="bg-carbon/70 border-amber/10 fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b px-[5%] py-5 backdrop-blur-md">
      <Link
        href="/"
        className="flex min-w-0 shrink-0 items-center gap-3 text-inherit no-underline"
        aria-label="Escola Flávio Milhomem — início"
      >
        <span className="border-amber text-amber grid h-11 w-11 shrink-0 place-items-center rounded-full border font-serif text-[20px] italic">
          FM
        </span>
        <span className="font-serif text-[28px] leading-tight">
          Flávio <em className="text-amber italic">Milhomem</em>
        </span>
      </Link>

      <div className="flex min-w-0 items-center justify-end gap-4 md:gap-8">
        <nav
          aria-label="Navegação principal"
          className="hidden min-w-0 items-center gap-6 md:flex lg:gap-8"
        >
          {navItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="text-paper-700 hover:text-paper font-mono text-[18px] uppercase tracking-[0.2em] transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="#cohort"
            className="border-amber text-amber hover:bg-amber hover:text-paper shrink-0 border px-4 py-2 font-mono text-[16px] uppercase tracking-[0.2em] transition-colors"
          >
            Cohort 2026 →
          </Link>
        </nav>

        <HeaderAccessibilityMenu />
      </div>
    </header>
  );
}
