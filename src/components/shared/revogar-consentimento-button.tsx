"use client";

import { useEffect, useState } from "react";

import {
  clearAnalyticsConsent,
  getAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics/consent";

const LABEL: Record<AnalyticsConsent, string> = {
  granted: "Você aceitou os cookies analíticos.",
  denied: "Você recusou os cookies analíticos.",
};

/**
 * Botão de revogação do consentimento, para a Política de Privacidade.
 *
 * Existe porque o art. 8º, §5º da LGPD exige procedimento gratuito e
 * facilitado para revogar — e até 14/08/2026 a única forma de mudar a escolha
 * era limpar os dados do site no navegador. A política, além disso, prometia
 * uma "página de preferências" que não existia.
 */
export function RevogarConsentimentoButton() {
  const [choice, setChoice] = useState<AnalyticsConsent | null | "loading">(
    "loading",
  );

  useEffect(() => {
    const sync = () => setChoice(getAnalyticsConsent());
    sync();
    window.addEventListener("fm-analytics-consent", sync);
    return () => window.removeEventListener("fm-analytics-consent", sync);
  }, []);

  if (choice === "loading") return null;

  return (
    <div className="border-paper-100/60 mt-4 rounded-lg border p-4">
      <p className="text-paper-700 text-sm">
        {choice === null
          ? "Você ainda não registrou uma escolha sobre cookies analíticos — o aviso aparece no rodapé desta página."
          : LABEL[choice]}
      </p>
      {choice !== null ? (
        <button
          type="button"
          onClick={clearAnalyticsConsent}
          className="border-amber/60 text-amber hover:bg-amber hover:text-carbon focus-visible:outline-amber mt-3 rounded border px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Rever minha escolha
        </button>
      ) : null}
    </div>
  );
}
