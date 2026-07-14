import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Slugifica string para uso em URL (artigos, materiais, etc). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Fração 0–1 → inteiro 0–100 para `<Progress value={…} />` (shadcn). */
export function progressPercentFromRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) return 0;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

/** Centavos → moeda BRL formatada (ex.: R$ 297,00). */
export function formatBRLFromCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/** ISO → data por extenso pt-BR (ex.: 14 de julho de 2026). */
export function formatDateLongPtBR(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** ISO → data curta numérica pt-BR (ex.: 14/07/26). */
export function formatDateShortPtBR(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}
