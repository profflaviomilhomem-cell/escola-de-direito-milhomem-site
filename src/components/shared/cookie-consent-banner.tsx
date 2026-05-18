"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics/consent";

/**
 * Banner LGPD — escolha explícita antes de carregar pixels e PostHog.
 * GTM no layout raiz permanece; eventos customizados respeitam o gate em `track()`.
 */
export function CookieConsentBanner() {
  const [choice, setChoice] = useState<AnalyticsConsent | null | "loading">(
    "loading",
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setChoice(getAnalyticsConsent());
    });
    return () => cancelAnimationFrame(id);
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
      className="border-amber/30 bg-carbon-elevated/95 fixed bottom-0 left-0 right-0 z-[60] border-t fm-site-section py-5 backdrop-blur-md"
    >
      <div className="fm-site-container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p
            id="cookie-consent-title"
            className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]"
          >
            Privacidade e cookies
          </p>
          <p
            id="cookie-consent-desc"
            className="text-paper-700 mt-2 text-sm leading-relaxed"
          >
            Usamos cookies analíticos para medir o uso do site (PostHog, tags de
            marketing quando configuradas). Você pode aceitar ou recusar — a
            navegação continua em ambos os casos. Detalhes em{" "}
            <Link
              href="/privacidade"
              className="text-amber underline-offset-2 hover:underline"
            >
              Privacidade
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={decline}
            className="border-paper-200 text-paper-700 hover:border-paper border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={accept}
            className="bg-amber text-paper hover:bg-amber-soft px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
