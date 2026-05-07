/**
 * Utilitários compartilhados — pequenos helpers sem dependência de domínio.
 */

/** Concatena classes de forma segura, descartando falsy. */
export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

/** Slugifica string para uso em URL (artigos, materiais, etc). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
