"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { copy } from "@/config/copy";
import {
  dismissNewsletterPopup,
  isNewsletterPopupDismissed,
  isNewsletterPopupExcluded,
  NEWSLETTER_POPUP_DELAY_MS,
} from "@/lib/newsletter-popup";

const { newsletter } = copy;

/**
 * FAB + modal de captura da newsletter.
 * Abre automaticamente após 30s; FAB permanece para reabrir.
 * Cookie banner fica à direita — FAB à esquerda.
 */
export function NewsletterPopup() {
  const pathname = usePathname();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  const excluded =
    !pathname || isNewsletterPopupExcluded(pathname) || isNewsletterPopupDismissed();

  const close = useCallback((persist = true) => {
    setOpen(false);
    if (persist) dismissNewsletterPopup();
  }, []);

  const openModal = useCallback(() => {
    if (excluded) return;
    setOpen(true);
  }, [excluded]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!ready || excluded) return;

    timerRef.current = setTimeout(() => {
      if (!isNewsletterPopupDismissed()) setOpen(true);
    }, NEWSLETTER_POPUP_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ready, excluded, pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!ready || excluded) return null;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="fm-newsletter-fab border-amber/35 bg-carbon-elevated/90 text-paper hover:border-amber/60 fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-[55] flex max-w-[min(calc(100vw-1.5rem),14rem)] items-center gap-2 rounded-full border px-3.5 py-2.5 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.5)] backdrop-blur-md transition-colors sm:left-4"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="newsletter-popup-dialog"
      >
        <span
          className="bg-amber/15 text-amber flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          aria-hidden
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <path d="m22 6-10 7L2 6" />
          </svg>
        </span>
        <span className="text-left leading-tight">
          <span className="text-amber block font-mono text-[8px] uppercase tracking-[0.18em]">
            {newsletter.eyebrow}
          </span>
          <span className="block text-[12px] font-medium">Entre na lista</span>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-carbon/70 backdrop-blur-[2px]"
            aria-label="Fechar"
            onClick={() => close()}
          />

          <div
            id="newsletter-popup-dialog"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            tabIndex={-1}
            className="border-paper-100/50 bg-carbon-elevated/96 relative z-10 w-full max-w-md rounded-lg border shadow-[0_16px_48px_-12px_rgba(0,0,0,0.55)] backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-3 border-b border-paper-100/40 px-4 py-3.5 sm:px-5">
              <div className="min-w-0 pr-2">
                <p
                  id={titleId}
                  className="text-amber font-mono text-[9px] uppercase tracking-[0.2em]"
                >
                  {newsletter.eyebrow}
                </p>
                <h2 className="font-display text-paper mt-1 text-lg leading-snug sm:text-xl">
                  {newsletter.title}{" "}
                  <em className="text-amber not-italic">
                    {newsletter.titleEmphasis}
                  </em>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => close()}
                className="text-paper-600 hover:text-paper border-paper-100/40 hover:border-paper-100/70 shrink-0 rounded-md border p-1.5 transition-colors"
                aria-label="Fechar janela"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <p
                id={descId}
                className="text-paper-700 mb-4 text-[13px] leading-relaxed"
              >
                {newsletter.lead}
              </p>

              <NewsletterForm
                source="popup"
                compact
                onSuccess={() => close(true)}
              />

              <p className="text-paper-600 mt-3 text-center text-[11px]">
                <Link
                  href="/newsletter"
                  className="text-amber underline-offset-2 hover:underline"
                  onClick={() => close(false)}
                >
                  Ver página completa
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
