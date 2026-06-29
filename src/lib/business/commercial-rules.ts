import type {
  OrderStatus,
  ProductType,
  SubscriptionStatus,
} from "@prisma/client";

/**
 * Regras comerciais Fase 1 — fonte única para `enrollment` e checkout.
 * Documentação: docs/FASE-1-COMERCIAL.md
 */

/** Status de pedido que liberam acesso a produtos de compra única. */
export const ORDER_STATUSES_WITH_ACCESS: readonly OrderStatus[] = [
  "PAID",
  "AUTHORIZED",
] as const;

/** Assinatura ativa libera produtos COMUNIDADE. */
export const SUBSCRIPTION_STATUS_WITH_ACCESS: SubscriptionStatus = "ACTIVE";

export const MVP_PAYMENT_METHODS = ["PIX", "BOLETO"] as const;
export type MvpPaymentMethod = (typeof MVP_PAYMENT_METHODS)[number];

export function isMvpPaymentMethod(value: string): value is MvpPaymentMethod {
  return (MVP_PAYMENT_METHODS as readonly string[]).includes(value);
}

export function productUsesOrderAccess(type: ProductType): boolean {
  return type === "COHORT" || type === "TRIPWIRE";
}

export function productUsesSubscriptionAccess(type: ProductType): boolean {
  return type === "COMUNIDADE";
}

export function productGrantsAccessInMvp(type: ProductType): boolean {
  return productUsesOrderAccess(type) || productUsesSubscriptionAccess(type);
}
