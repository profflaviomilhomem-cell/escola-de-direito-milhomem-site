import type { OrderStatus, PaymentMethod } from "@prisma/client";

import type { PagarmeCharge, PagarmeOrderResponse } from "@/lib/pagarme/types";

export function mapChargeStatusToOrderStatus(
  chargeStatus: string | undefined,
): OrderStatus {
  switch ((chargeStatus ?? "").toLowerCase()) {
    case "paid":
      return "PAID";
    case "pending":
      return "PENDING";
    case "failed":
    case "canceled":
      return "REFUSED";
    case "refunded":
      return "REFUNDED";
    default:
      return "PENDING";
  }
}

export function primaryCharge(
  order: PagarmeOrderResponse,
): PagarmeCharge | null {
  return order.charges?.[0] ?? null;
}

export type CheckoutPaymentPayload = {
  method: PaymentMethod;
  chargeId?: string;
  chargeStatus?: string;
  pixQrCode?: string;
  pixQrCodeUrl?: string;
  boletoPdf?: string;
  boletoLine?: string;
  boletoUrl?: string;
  expiresAt?: string;
};

export function extractPaymentPayload(
  method: PaymentMethod,
  charge: PagarmeCharge | null,
): CheckoutPaymentPayload {
  const tx = charge?.last_transaction;
  return {
    method,
    chargeId: charge?.id,
    chargeStatus: charge?.status ?? tx?.status,
    pixQrCode: tx?.qr_code,
    pixQrCodeUrl: tx?.qr_code_url,
    boletoPdf: tx?.pdf,
    boletoLine: tx?.line,
    boletoUrl: tx?.url,
    expiresAt: tx?.expires_at,
  };
}
