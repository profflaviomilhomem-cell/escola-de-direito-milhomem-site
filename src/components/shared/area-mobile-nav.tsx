"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useMobileNavLock } from "@/lib/ui/use-mobile-nav-lock";

export type AreaNavLink = {
  label: string;
  href: string;
};

type Props = {
  links: AreaNavLink[];
  ariaLabel?: string;
  cta?: { href: string; label: string };
};

/**
 * Menu mobile em tela cheia — mesmo padrão do `HeaderMobileNav` institucional.
 */
export function AreaMobileNav({
  links,
  ariaLabel = "Navegação mobile",
  cta,
}: Props) {
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
            id="area-mobile-nav-panel"
            aria-label={ariaLabel}
            className="fm-mobile-nav-panel"
          >
            <div className="fm-mobile-nav-panel__inner">
              <div className="fm-mobile-nav-panel__bar">
                <span className="fm-mobile-nav-panel__eyebrow">Menu</span>
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
                  {links.map((item) => (
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
              </div>

              {cta ? (
                <Link
                  href={cta.href}
                  onClick={close}
                  className="fm-mobile-nav-panel__cta"
                >
                  {cta.label}
                </Link>
              ) : null}
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
        aria-controls="area-mobile-nav-panel"
      >
        Menu
      </button>
      {menu}
    </div>
  );
}
