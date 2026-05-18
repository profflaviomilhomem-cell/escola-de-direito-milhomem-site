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
