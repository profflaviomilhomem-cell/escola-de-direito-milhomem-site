"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { label: "Início", href: "/aluno/dashboard" },
  { label: "Cursos", href: "/aluno/cursos/direito-penal-acusatorio-lancamento" },
  { label: "Fórum", href: "/aluno/forum" },
  { label: "Certificados", href: "/aluno/certificados" },
];

type Props = {
  userName: string;
  userEmail: string;
  initials: string;
};

/**
 * Top nav sticky inspirada no padrão streaming: transparente sobre o
 * billboard, vira "glass" (carbon a 85% + blur) depois dos primeiros
 * pixels de scroll. O hover trapeza navegação principal e abre menu de
 * perfil.
 */
export function AlunoTopNav({ userName, userEmail, initials }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/aluno/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-carbon/85 border-paper-100 border-b backdrop-blur-md"
          : "bg-gradient-to-b from-carbon to-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-(--container-narrow) items-center justify-between px-gutter py-4 lg:px-12">
        {/* Logo + brand */}
        <div className="flex items-center gap-8">
          <Link
            href="/aluno/dashboard"
            className="flex items-center gap-3 no-underline"
            aria-label="Escola Flávio Milhomem — área do aluno"
          >
            <span className="border-amber text-amber grid h-9 w-9 place-items-center rounded-full border font-serif text-base italic">
              FM
            </span>
            <span className="hidden font-serif text-[20px] leading-none md:inline">
              Escola
            </span>
          </Link>

          <nav
            aria-label="Navegação do aluno"
            className="hidden items-center gap-6 md:flex"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`fm-mono font-mono transition-colors ${
                  isActive(l.href)
                    ? "text-paper"
                    : "text-paper-600 hover:text-paper"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Profile + actions */}
        <div className="flex items-center gap-4">
          {/* Search ícone — placeholder visual */}
          <button
            type="button"
            aria-label="Buscar (em breve)"
            className="text-paper-600 hover:text-paper hidden transition-colors md:block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
              className="border-amber/60 bg-carbon-elevated text-amber hover:border-amber flex items-center gap-2 rounded-full border pl-1 pr-3 py-1 transition-colors"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="bg-amber text-carbon grid h-7 w-7 place-items-center rounded-full font-mono text-xs font-bold">
                {initials}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="border-paper-200 bg-carbon-elevated absolute right-0 mt-2 w-64 origin-top-right border shadow-2xl"
              >
                <div className="border-paper-100 border-b px-4 py-3">
                  <p className="text-paper text-sm font-semibold">{userName}</p>
                  <p className="text-paper-600 mt-1 text-xs">{userEmail}</p>
                </div>
                <ul className="py-1">
                  <li>
                    <Link
                      href="/aluno/minha-conta"
                      className="text-paper-700 hover:bg-paper-100 hover:text-paper block px-4 py-2 text-sm"
                      role="menuitem"
                    >
                      Minha conta
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/aluno/certificados"
                      className="text-paper-700 hover:bg-paper-100 hover:text-paper block px-4 py-2 text-sm"
                      role="menuitem"
                    >
                      Certificados
                    </Link>
                  </li>
                  <li className="border-paper-100 mt-1 border-t pt-1">
                    <form action="/api/auth/logout" method="post">
                      <button
                        type="submit"
                        className="text-paper-700 hover:bg-paper-100 hover:text-paper block w-full px-4 py-2 text-left text-sm"
                        role="menuitem"
                      >
                        Sair
                      </button>
                    </form>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Mobile hamburguer */}
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="text-paper md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav
          aria-label="Navegação móvel"
          className="border-paper-100 bg-carbon/95 border-t backdrop-blur-md md:hidden"
        >
          <ul className="px-gutter flex flex-col py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`fm-mono block py-3 ${
                    isActive(l.href) ? "text-amber" : "text-paper-700"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
