"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { label: "Painel", href: "/professor/dashboard" },
  { label: "Aulas", href: "/professor/aulas" },
  { label: "Blog", href: "/professor/blog" },
  { label: "Fórum", href: "/professor/forum" },
  { label: "Alunos", href: "/professor/alunos" },
  { label: "Anúncios", href: "/professor/anuncios" },
  { label: "Métricas", href: "/professor/metricas" },
];

type Props = {
  userName: string;
  userEmail: string;
  avatarSrc: string;
};

/**
 * Top nav exclusiva da área do professor — paralela à `AlunoTopNav`,
 * mas com links administrativos. Brand mark explicita "Painel do
 * Professor" para diferenciar visualmente do painel do aluno.
 */
export function ProfessorTopNav({ userName, userEmail, avatarSrc }: Props) {
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
    href === "/professor/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <header
      className={`fm-a11y-chrome fm-site-section fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-carbon/85 border-paper-100 border-b backdrop-blur-md"
          : "bg-gradient-to-b from-carbon to-transparent"
      }`}
    >
      <div className="fm-site-container flex items-center justify-between py-5">
        {/* Logo + brand */}
        <div className="flex items-center gap-8 lg:gap-10">
          <Link
            href="/professor/dashboard"
            className="flex items-center gap-3 no-underline"
            aria-label="Escola Flávio Milhomem — painel do professor"
          >
            <span className="border-amber bg-amber/10 text-amber grid h-11 w-11 place-items-center rounded-full border-2 font-serif text-[20px] italic">
              FM
            </span>
            <span className="hidden font-serif leading-tight md:inline">
              <span className="text-[22px] block">Escola</span>
              <span className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
                Painel do professor
              </span>
            </span>
          </Link>

          <nav
            aria-label="Navegação do professor"
            className="hidden items-center gap-7 md:flex"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`font-mono text-[14px] uppercase tracking-[0.2em] transition-colors ${
                  isActive(l.href)
                    ? "text-paper"
                    : "text-paper-700 hover:text-paper"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Profile + actions */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
              className="border-amber/60 bg-carbon-elevated text-amber hover:border-amber flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition-colors"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <Image
                src={avatarSrc}
                alt={userName}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
                className="border-paper-200 bg-carbon-elevated absolute right-0 mt-2 w-72 origin-top-right border shadow-2xl"
              >
                <div className="border-paper-100 border-b px-4 py-3">
                  <p className="text-paper text-sm font-semibold">
                    {userName}
                  </p>
                  <p className="text-paper-600 mt-1 truncate text-xs">
                    {userEmail}
                  </p>
                  <p className="text-amber mt-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                    Sessão de admin
                  </p>
                </div>
                <ul className="py-1">
                  <li>
                    <Link
                      href="/aluno/dashboard"
                      className="text-paper-700 hover:bg-paper-100 hover:text-paper block px-4 py-2 text-sm"
                      role="menuitem"
                    >
                      Ver como aluno
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sobre"
                      className="text-paper-700 hover:bg-paper-100 hover:text-paper block px-4 py-2 text-sm"
                      role="menuitem"
                    >
                      Página pública
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

          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="text-paper md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
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

      {mobileOpen && (
        <nav
          aria-label="Navegação móvel"
          className="border-paper-100 bg-carbon/95 border-t backdrop-blur-md md:hidden"
        >
          <ul className="fm-site-container flex flex-col py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`font-mono text-[14px] uppercase tracking-[0.2em] block py-3 ${
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
