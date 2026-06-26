"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { siteConfig } from "@/config/site";
import { useMobileNavLock } from "@/lib/ui/use-mobile-nav-lock";

/**
 * Menu mobile em tela cheia — portal no body, tipografia controlada via CSS.
 */
export function HeaderMobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useMobileNavLock(open);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
            className="fm-mobile-nav-panel"
          >
            <div className="fm-mobile-nav-panel__inner">
              <div className="fm-mobile-nav-panel__bar">
                <span className="fm-mobile-nav-panel__eyebrow">Navegação</span>
                <button
                  type="button"
                  onClick={close}
                  className="fm-mobile-nav-panel__close"
                >
                  Fechar
                </button>
              </div>

              <div className="fm-mobile-nav-panel__scroll">
                <ul className="fm-mobile-nav-panel__list">
                  {siteConfig.mainNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className="fm-mobile-nav-link"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {siteConfig.secondaryNav.length > 0 ? (
                  <div className="fm-mobile-nav-panel__section">
                    <p className="fm-mobile-nav-panel__section-label">Mais</p>
                    <ul className="fm-mobile-nav-panel__list">
                      {siteConfig.secondaryNav.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className="fm-mobile-nav-link fm-mobile-nav-link--secondary"
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
                className="fm-mobile-nav-panel__cta"
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
        className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber border px-3 py-2 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
      >
        Menu
      </button>
      {menu}
    </div>
  );
}
