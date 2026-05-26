import Link from "next/link";

import { InstitutionalNotice } from "@/components/marketing/institutional-notice";
import { BrandLogo } from "@/components/shared/brand-logo";
import { siteConfig } from "@/config/site";

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      />
    </svg>
  );
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>
  );
}

function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

const socialPillClass =
  "border-paper-200 text-paper-700 hover:border-amber hover:bg-amber/5 hover:text-amber group inline-flex items-center gap-2.5 rounded-full border bg-carbon-elevated/50 px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.18em] transition-colors";

/**
 * Footer institucional dark — absorvido do mockup oficial.
 * Minimal, centralizado: brand + crédito + links legais + canais.
 */
export function Footer() {
  return (
    <footer className="border-amber/20 fm-site-section relative z-10 border-t py-16 text-center">
      <div className="fm-site-container">
      <Link
        href="/"
        className="mx-auto inline-flex flex-col items-center justify-center text-inherit no-underline"
        aria-label={`${siteConfig.name} — início`}
      >
        <BrandLogo variant="stacked" className="mx-auto" />
      </Link>
      <p className="text-paper-500 mx-auto mt-3 max-w-sm font-mono text-[10px] uppercase tracking-[0.22em]">
        {siteConfig.taglineInstitucional}
      </p>

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
          href="/cursos/edicao-lancamento#faq"
          className="text-paper-700 hover:text-amber transition-colors"
        >
          FAQ
        </Link>
        {siteConfig.secondaryNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-paper-700 hover:text-amber transition-colors"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/privacidade"
          className="text-paper-700 hover:text-amber transition-colors"
        >
          Privacidade
        </Link>
        <Link
          href="/termos"
          className="text-paper-700 hover:text-amber transition-colors"
        >
          Termos
        </Link>
        <Link
          href="/reembolso"
          className="text-paper-700 hover:text-amber transition-colors"
        >
          Reembolso
        </Link>
      </nav>

      <div className="mt-8 flex flex-col items-center gap-6">
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="text-paper-600 hover:text-amber font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
        >
          {siteConfig.contact.email}
        </a>

        <nav
          aria-label="Redes sociais do Flávio Milhomem"
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={socialPillClass}
          >
            <IconInstagram className="text-amber h-[18px] w-[18px] shrink-0 opacity-90 group-hover:opacity-100" />
            <span className="flex flex-col items-start gap-0.5 leading-tight">
              <span>Instagram</span>
              <span className="text-paper-500 group-hover:text-paper-600 normal-case tracking-normal">
                {siteConfig.social.instagramHandle}
              </span>
            </span>
          </a>
          <a
            href={siteConfig.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className={socialPillClass}
          >
            <IconYoutube className="text-amber h-[18px] w-[18px] shrink-0 opacity-90 group-hover:opacity-100" />
            <span className="flex flex-col items-start gap-0.5 leading-tight">
              <span>YouTube</span>
              <span className="text-paper-500 group-hover:text-paper-600 normal-case tracking-normal">
                {siteConfig.social.youtubeFooterLabel}
              </span>
            </span>
          </a>
          <a
            href={siteConfig.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={socialPillClass}
          >
            <IconLinkedin className="text-amber h-[18px] w-[18px] shrink-0 opacity-90 group-hover:opacity-100" />
            <span className="flex flex-col items-start gap-0.5 leading-tight">
              <span>LinkedIn</span>
              <span className="text-paper-500 group-hover:text-paper-600 normal-case tracking-normal">
                {siteConfig.social.linkedinFooterLabel}
              </span>
            </span>
          </a>
        </nav>
      </div>

      <InstitutionalNotice className="mx-auto mt-10 max-w-xl" />

      <p className="text-paper-400 mt-8 font-mono text-[9px] tracking-[0.3em]">
        © {new Date().getFullYear()} {siteConfig.name.toUpperCase()} ·
        DESENVOLVIDO POR ORBEE LABS · TODOS OS DIREITOS RESERVADOS
      </p>
      </div>
    </footer>
  );
}
