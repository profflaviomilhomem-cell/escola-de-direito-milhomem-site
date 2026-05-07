import Link from "next/link";

import { siteConfig } from "@/config/site";

/**
 * Footer institucional dark — absorvido do mockup oficial.
 * Minimal, centralizado: brand + crédito + links legais + canais.
 */
export function Footer() {
  return (
    <footer className="border-amber/20 relative z-10 border-t px-[5%] py-16 text-center">
      <Link
        href="/"
        className="mx-auto inline-flex items-center justify-center gap-3 text-inherit no-underline"
      >
        <span className="border-amber text-amber grid h-9 w-9 place-items-center rounded-full border font-serif italic">
          FM
        </span>
        <span className="font-serif text-base">
          Flávio <em className="text-amber italic">Milhomem</em>
        </span>
      </Link>

      <nav
        aria-label="Mapa do site"
        className="mt-8 flex flex-wrap items-center justify-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em]"
      >
        <Link
          href="/sobre"
          className="text-paper-700 hover:text-amber transition-colors"
        >
          Sobre
        </Link>
        <Link
          href="/cursos"
          className="text-paper-700 hover:text-amber transition-colors"
        >
          Cursos
        </Link>
        <Link
          href="/blog"
          className="text-paper-700 hover:text-amber transition-colors"
        >
          Blog
        </Link>
        <Link
          href="/calculadora-de-pena"
          className="text-paper-700 hover:text-amber transition-colors"
        >
          Calculadora
        </Link>
        <Link
          href="/contato"
          className="text-paper-700 hover:text-amber transition-colors"
        >
          Contato
        </Link>
        <Link
          href="/privacidade"
          className="text-paper-700 hover:text-amber transition-colors"
        >
          Privacidade
        </Link>
      </nav>

      <div className="text-paper-600 mt-6 flex flex-wrap items-center justify-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em]">
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="hover:text-amber transition-colors"
        >
          {siteConfig.contact.email}
        </a>
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-amber transition-colors"
        >
          Instagram · {siteConfig.social.instagramHandle}
        </a>
        <a
          href={siteConfig.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-amber transition-colors"
        >
          LinkedIn
        </a>
      </div>

      <p className="text-paper-400 mt-10 font-mono text-[9px] tracking-[0.3em]">
        © {new Date().getFullYear()} {siteConfig.name.toUpperCase()} ·
        DESENVOLVIDO POR ORBEE LABS · TODOS OS DIREITOS RESERVADOS
      </p>
    </footer>
  );
}
