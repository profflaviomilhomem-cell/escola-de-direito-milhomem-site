"use client";

import Link from "next/link";
import { useState } from "react";

import { AreaShellHeader } from "@/components/shared/area-shell-header";
import type { AreaNavLink } from "@/components/shared/area-mobile-nav";

const links: AreaNavLink[] = [
  { label: "Início", href: "/aluno/dashboard" },
  { label: "Cursos", href: "/aluno/cursos" },
  { label: "Fórum", href: "/aluno/forum" },
  { label: "Certificados", href: "/aluno/certificados" },
];

type Props = {
  userName: string;
  userEmail: string;
  initials: string;
};

/**
 * Top nav da área do aluno — header institucional + menu de perfil.
 */
export function AlunoTopNav({ userName, userEmail, initials }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AreaShellHeader
      homeHref="/aluno/dashboard"
      homeAriaLabel="Escola Flávio Milhomem — área do aluno"
      navAriaLabel="Navegação do aluno"
      exactMatchHref="/aluno/dashboard"
      links={links}
      mobileCta={{ href: "/aluno/cursos", label: "Meus cursos" }}
      trailing={
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
            className="border-amber/60 bg-carbon-elevated text-amber hover:border-amber flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition-colors"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Menu da conta"
          >
            <span className="bg-amber text-carbon grid h-9 w-9 place-items-center rounded-full font-mono text-sm font-bold">
              {initials}
            </span>
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
              className={`hidden transition-transform sm:block ${menuOpen ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="border-paper-200 bg-carbon-elevated absolute right-0 z-[60] mt-2 w-64 origin-top-right border shadow-2xl"
            >
              <div className="border-paper-100 border-b px-4 py-3">
                <p className="text-paper text-sm font-semibold">{userName}</p>
                <p className="text-paper-600 mt-1 text-xs">{userEmail}</p>
              </div>
              <ul className="py-1">
                <li>
                  <Link
                    href="/aluno/minha-conta"
                    className="text-paper-700 hover:bg-paper/8 hover:text-paper block px-4 py-2 text-sm"
                    role="menuitem"
                  >
                    Minha conta
                  </Link>
                </li>
                <li>
                  <Link
                    href="/aluno/certificados"
                    className="text-paper-700 hover:bg-paper/8 hover:text-paper block px-4 py-2 text-sm"
                    role="menuitem"
                  >
                    Certificados
                  </Link>
                </li>
                <li className="border-paper-100 mt-1 border-t pt-1">
                  <form action="/api/auth/logout" method="post">
                    <button
                      type="submit"
                      className="text-paper-700 hover:bg-paper/8 hover:text-paper block w-full px-4 py-2 text-left text-sm"
                      role="menuitem"
                    >
                      Sair
                    </button>
                  </form>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      }
    />
  );
}
