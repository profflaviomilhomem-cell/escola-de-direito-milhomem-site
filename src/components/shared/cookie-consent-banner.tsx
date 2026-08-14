"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics/consent";

/**
 * Banner LGPD — compacto, canto inferior; escolha explícita antes de analytics.
 */
export function CookieConsentBanner() {
  const [choice, setChoice] = useState<AnalyticsConsent | null | "loading">(
    "loading",
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setChoice(getAnalyticsConsent());
    });
    // Ouve a revogação disparada em /privacidade (`clearAnalyticsConsent`) —
    // sem isto o banner já está renderizado como `null` e não voltaria, e a
    // revogação exigida pelo art. 8º, §5º só valeria depois de um reload.
    const sync = () => setChoice(getAnalyticsConsent());
    window.addEventListener("fm-analytics-consent", sync);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("fm-analytics-consent", sync);
    };
  }, []);

  if (choice === "loading" || choice !== null) return null;

  const accept = () => {
    setAnalyticsConsent("granted");
    setChoice("granted");
  };

  const decline = () => {
    setAnalyticsConsent("denied");
    setChoice("denied");
  };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fm-cookie-consent pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-4 sm:justify-end sm:p-4"
    >
      <div className="border-paper-100/60 bg-carbon-elevated/92 pointer-events-auto w-full max-w-[min(100%,22rem)] rounded-lg border shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)] backdrop-blur-md sm:max-w-[20rem]">
        <div className="flex items-start gap-2.5 px-3.5 py-3">
          <span
            className="bg-amber/15 text-amber mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
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
            >
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 0-5-5 4 4 0 0 0-5-5" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p id="cookie-consent-title" className="sr-only">
              Cookies e privacidade
            </p>
            <p
              id="cookie-consent-desc"
              className="text-paper-700 text-[12px] leading-snug"
            >
              Cookies analíticos opcionais.{" "}
              <Link
                href="/privacidade"
                className="text-amber underline-offset-2 hover:underline"
              >
                Privacidade
              </Link>
            </p>
            {/* Os dois botões têm a mesma caixa, o mesmo tipo e o mesmo peso:
                o guia de cookies da ANPD pede que recusar seja tão fácil e tão
                visível quanto aceitar. Até 14/08/2026 "Recusar" era texto solto
                ao lado de um botão âmbar preenchido. */}
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={decline}
                className="border-paper-100/70 text-paper-700 hover:border-paper-100 hover:text-paper rounded border px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] uppercase transition-colors"
              >
                Recusar
              </button>
              <button
                type="button"
                onClick={accept}
                className="border-amber/90 bg-amber/90 text-carbon hover:bg-amber hover:border-amber rounded border px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] uppercase transition-colors"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
