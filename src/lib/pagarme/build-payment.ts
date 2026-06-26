import type { PaymentMethod } from "@prisma/client";

import type { PagarmeCreateOrderInput } from "@/lib/pagarme/types";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function parseBrazilMobilePhone(raw: string): {
  country_code: string;
  area_code: string;
  number: string;
} | null {
  const digits = digitsOnly(raw);
  const normalized =
    digits.length === 13 && digits.startsWith("55")
      ? digits.slice(2)
      : digits.length === 11 || digits.length === 10
        ? digits
        : null;

  if (!normalized) return null;

  return {
    country_code: "55",
    area_code: normalized.slice(0, 2),
    number: normalized.slice(2),
  };
}

export function buildPagarmeCustomer(input: {
  name: string;
  email: string;
  document: string;
  phone: string;
}): PagarmeCreateOrderInput["customer"] {
  const phone = parseBrazilMobilePhone(input.phone);
  if (!phone) {
    throw new Error("Telefone inválido. Use DDD + número (10 ou 11 dígitos).");
  }

  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    type: "individual",
    document: digitsOnly(input.document),
    document_type: "CPF",
    phones: { mobile_phone: phone },
  };
}

export function buildPagarmePayments(input: {
  method: PaymentMethod;
  amountCents: number;
  cardToken?: string;
  installments?: number;
  billingAddress?: {
    line1: string;
    zipCode: string;
    city: string;
    state: string;
  };
}): PagarmeCreateOrderInput["payments"] {
  const pagarmeMethod =
    input.method === "PIX"
      ? "pix"
      : input.method === "BOLETO"
        ? "boleto"
        : "credit_card";

  if (pagarmeMethod === "pix") {
    return [
      {
        payment_method: "pix",
        amount: input.amountCents,
        pix: {
          expires_in: 3600,
          additional_information: [
            { name: "Escola", value: "Flavio Milhomem" },
          ],
        },
      },
    ];
  }

  if (pagarmeMethod === "boleto") {
    const addr = input.billingAddress;
    if (!addr) {
      throw new Error("Endereço obrigatório para boleto.");
    }

    return [
      {
        payment_method: "boleto",
        amount: input.amountCents,
        boleto: {
          instructions:
            "Pagamento referente a matrícula na Escola Flávio Milhomem.",
          due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          billing_address: {
            line_1: addr.line1,
            zip_code: digitsOnly(addr.zipCode),
            city: addr.city,
            state: addr.state.toUpperCase().slice(0, 2),
            country: "BR",
          },
        },
      },
    ];
  }

  if (!input.cardToken?.trim()) {
    throw new Error("Token do cartão ausente.");
  }

  return [
    {
      payment_method: "credit_card",
      amount: input.amountCents,
      credit_card: {
        installments: input.installments ?? 1,
        statement_descriptor: "ESCOLA FM",
        card_token: input.cardToken.trim(),
        billing_address: input.billingAddress
          ? {
              line_1: input.billingAddress.line1,
              zip_code: digitsOnly(input.billingAddress.zipCode),
              city: input.billingAddress.city,
              state: input.billingAddress.state.toUpperCase().slice(0, 2),
              country: "BR",
            }
          : undefined,
      },
    },
  ];
}
