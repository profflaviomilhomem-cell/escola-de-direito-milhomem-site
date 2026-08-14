/** Chave localStorage — consentimento LGPD para cookies analíticos. */
export const ANALYTICS_CONSENT_KEY = "fm-analytics-consent";

export type AnalyticsConsent = "granted" | "denied";

export function getAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (v === "granted" || v === "denied") return v;
    return null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getAnalyticsConsent() === "granted";
}

export function setAnalyticsConsent(value: AnalyticsConsent): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    window.dispatchEvent(
      new CustomEvent("fm-analytics-consent", { detail: value }),
    );
  } catch {
    /* storage bloqueado — ignora */
  }
}

/**
 * Revoga a escolha e devolve o visitante ao estado "ainda não decidiu" —
 * o banner reaparece na próxima renderização.
 *
 * Existe por exigência do art. 8º, §5º da LGPD: o consentimento pode ser
 * revogado a qualquer momento por procedimento gratuito e facilitado. Até
 * 14/08/2026 não havia nenhum: quem clicasse em "Aceitar" só voltaria atrás
 * limpando os dados do site no navegador, o que não é procedimento facilitado.
 *
 * A revogação não desfaz coleta já ocorrida — os scripts só param de carregar
 * a partir da próxima navegação, e é isso que a política declara.
 */
export function clearAnalyticsConsent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ANALYTICS_CONSENT_KEY);
    window.dispatchEvent(
      new CustomEvent("fm-analytics-consent", { detail: null }),
    );
  } catch {
    /* storage bloqueado — ignora */
  }
}
