"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { siteConfig } from "@/config/site";

/** Fundo do painel — opaco o suficiente para ler; blur é camada extra. */
const PANEL_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(3, 0, 36, 0.97)",
  WebkitBackdropFilter: "blur(24px) saturate(1.4)",
  backdropFilter: "blur(24px) saturate(1.4)",
};

/**
 * Menu mobile em tela cheia — vidro fosco + fundo navy quase sólido.
 * Renderizado via portal para não competir com o hero.
 */
export function HeaderMobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setOpen(false);

  const menu =
    open && mounted
      ? createPortal(
          <nav
            id="mobile-nav-panel"
            aria-label="Navegação mobile"
            className="fixed inset-0 z-[200] flex flex-col pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]"
            style={PANEL_STYLE}
          >
            {/* Camada extra de opacidade — garante leitura se blur falhar no browser */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-carbon"
              style={{ opacity: 0.92 }}
            />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              <div className="border-paper-100/30 mb-8 flex shrink-0 items-center justify-between border-b pb-5">
                <span className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
                  Navegação
                </span>
                <button
                  type="button"
                  onClick={close}
                  className="border-paper-200 text-paper bg-carbon-elevated/80 hover:border-amber hover:text-amber border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors"
                >
                  Fechar
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                <ul className="flex flex-col gap-1">
                  {siteConfig.mainNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className="text-paper hover:bg-paper/8 hover:text-amber block rounded-lg px-3 py-3.5 font-mono text-[15px] uppercase tracking-[0.2em] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {siteConfig.secondaryNav.length > 0 ? (
                  <div className="border-paper-100/30 mt-8 border-t pt-8">
                    <p className="text-paper-500 mb-4 font-mono text-[10px] uppercase tracking-[0.2em]">
                      Mais
                    </p>
                    <ul className="flex flex-col gap-1">
                      {siteConfig.secondaryNav.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className="text-paper-800 hover:bg-paper/8 hover:text-paper block rounded-lg px-3 py-2.5 text-base transition-colors"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <Link
                href="/newsletter"
                onClick={close}
                className="bg-amber text-paper hover:bg-amber-soft relative z-10 mt-6 shrink-0 px-6 py-4 text-center font-mono text-[11px] uppercase tracking-[0.16em] transition-colors"
              >
                Entre na lista
              </Link>
            </div>
          </nav>,
          document.body,
        )
      : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
      >
        Menu
      </button>
      {menu}
    </div>
  );
}
