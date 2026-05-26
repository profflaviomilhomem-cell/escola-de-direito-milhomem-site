const STORAGE_KEY = "fm-newsletter-popup-dismissed";

/** Páginas onde o popup / FAB não aparecem */
export function isNewsletterPopupExcluded(pathname: string): boolean {
  return (
    pathname.startsWith("/newsletter") ||
    pathname.startsWith("/entrar") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/recuperar-senha") ||
    pathname.startsWith("/esqueci-senha") ||
    pathname.startsWith("/aluno") ||
    pathname.startsWith("/professor")
  );
}

export function isNewsletterPopupDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissNewsletterPopup(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

export const NEWSLETTER_POPUP_DELAY_MS = 30_000;
