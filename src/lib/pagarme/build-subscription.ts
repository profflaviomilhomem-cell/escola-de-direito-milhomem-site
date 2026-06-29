import type { PaymentMethod, Product } from "@prisma/client";

import type { PagarmeCreateOrderInput } from "@/lib/pagarme/types";
import { digitsOnly } from "@/lib/pagarme/build-payment";

export function buildPagarmeSubscriptionInput(input: {
  code: string;
  product: Product;
  customer: PagarmeCreateOrderInput["customer"];
  paymentMethod: PaymentMethod;
  cardToken?: string;
  installments?: number;
  billingAddress?: {
    line1: string;
    zipCode: string;
    city: string;
    state: string;
  };
  metadata: Record<string, string>;
}): Record<string, unknown> {
  const pagarmeMethod =
    input.paymentMethod === "BOLETO" ? "boleto" : "credit_card";

  if (pagarmeMethod === "credit_card" && !input.cardToken?.trim()) {
    throw new Error("Token do cartão ausente para assinatura.");
  }

  const body: Record<string, unknown> = {
    code: input.code,
    payment_method: pagarmeMethod,
    currency: "BRL",
    interval: "month",
    interval_count: 1,
    billing_type: "prepaid",
    customer: input.customer,
    items: [
      {
        description: input.product.name.slice(0, 256),
        quantity: 1,
        code: input.product.slug,
        pricing_scheme: {
          scheme_type: "unit",
          price: input.product.priceCents,
        },
      },
    ],
    metadata: input.metadata,
    statement_descriptor: "ESCOLA FM",
  };

  if (pagarmeMethod === "credit_card") {
    body.card = {
      card_token: input.cardToken!.trim(),
      billing_address: input.billingAddress
        ? {
            line_1: input.billingAddress.line1,
            zip_code: digitsOnly(input.billingAddress.zipCode),
            city: input.billingAddress.city,
            state: input.billingAddress.state.toUpperCase().slice(0, 2),
            country: "BR",
          }
        : undefined,
    };
    body.installments = input.installments ?? 1;
  }

  if (pagarmeMethod === "boleto") {
    const addr = input.billingAddress;
    if (!addr) {
      throw new Error("Endereço obrigatório para boleto da assinatura.");
    }
    body.boleto = {
      instructions: "Assinatura mensal — Escola Flávio Milhomem.",
      billing_address: {
        line_1: addr.line1,
        zip_code: digitsOnly(addr.zipCode),
        city: addr.city,
        state: addr.state.toUpperCase().slice(0, 2),
        country: "BR",
      },
    };
  }

  return body;
}
