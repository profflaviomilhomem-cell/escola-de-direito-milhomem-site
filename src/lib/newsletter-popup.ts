const STORAGE_KEY = "fm-newsletter-popup-dismissed";

/**
 * Páginas onde o popup / FAB não aparecem — inclui as que já têm o próprio
 * formulário de captura como CTA principal (o FAB seria redundante e disputa
 * o canto inferior-esquerdo com o form): /newsletter, /eventos e /calculadora.
 */
export function isNewsletterPopupExcluded(pathname: string): boolean {
  return (
    pathname.startsWith("/newsletter") ||
    pathname.startsWith("/eventos") ||
    pathname.startsWith("/calculadora") ||
    // 14/08/2026: durante o pagamento nada disputa a atenção. Um modal pedindo
    // e-mail no meio do checkout é abandono de carrinho pedido por escrito.
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/entrar") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/recuperar-senha") ||
    pathname.startsWith("/esqueci-senha") ||
    pathname.startsWith("/aluno") ||
    pathname.startsWith("/professor")
  );
}

/**
 * Páginas onde a pílula continua disponível, mas o modal NÃO abre sozinho.
 *
 * A página de curso é uma página de venda: quem está nela está decidindo uma
 * compra. Interromper essa decisão com um modal que pede e-mail para uma
 * newsletter gratuita é a oferta menor canibalizando a maior — e o modal ainda
 * trava o scroll do corpo, então ele interrompe inclusive quem está no meio da
 * demonstração da cadeia de custódia.
 *
 * A pílula fica: quem não vai comprar hoje ainda pode entrar na lista, e ela
 * não interrompe ninguém.
 */
export function isNewsletterAutoOpenSuppressed(pathname: string): boolean {
  return pathname.startsWith("/cursos");
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
