"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { AreaShellHeader } from "@/components/shared/area-shell-header";
import type { AreaNavLink } from "@/components/shared/area-mobile-nav";

const links: AreaNavLink[] = [
  { label: "Painel", href: "/professor/dashboard" },
  { label: "Cursos", href: "/professor/cursos" },
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
 * Top nav da área do professor — header institucional + menu de perfil.
 */
export function ProfessorTopNav({ userName, userEmail, avatarSrc }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AreaShellHeader
      homeHref="/professor/dashboard"
      homeAriaLabel="Escola Flávio Milhomem — painel do professor"
      navAriaLabel="Navegação do professor"
      exactMatchHref="/professor/dashboard"
      links={links}
      compactNav
      mobileCta={{ href: "/professor/cursos", label: "Gerenciar cursos" }}
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
            <Image
              src={avatarSrc}
              alt=""
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
              className={`hidden transition-transform sm:block ${menuOpen ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="border-paper-200 bg-carbon-elevated absolute right-0 z-[60] mt-2 w-72 origin-top-right border shadow-2xl"
            >
              <div className="border-paper-100 border-b px-4 py-3">
                <p className="text-paper text-sm font-semibold">{userName}</p>
                <p className="text-paper-600 mt-1 truncate text-xs">{userEmail}</p>
                <p className="text-amber mt-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                  Sessão de admin
                </p>
              </div>
              <ul className="py-1">
                <li>
                  <Link
                    href="/aluno/dashboard"
                    className="text-paper-700 hover:bg-paper/8 hover:text-paper block px-4 py-2 text-sm"
                    role="menuitem"
                  >
                    Ver como aluno
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-paper-700 hover:bg-paper/8 hover:text-paper block px-4 py-2 text-sm"
                    role="menuitem"
                  >
                    Site institucional
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
