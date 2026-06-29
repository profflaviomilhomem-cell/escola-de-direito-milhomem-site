import type { CheckoutPaymentPayload } from "@/lib/pagarme/map-status";

export type CreateCheckoutResult =
  | {
      ok: true;
      orderId: string;
      status: string;
      payment: CheckoutPaymentPayload;
      redirectTo: string;
    }
  | { ok: false; code: string; message: string; status: number };
