import { z } from "zod";

import { digitsOnly } from "@/lib/pagarme/build-payment";

export const paymentMethodSchema = z.enum(["PIX", "BOLETO", "CARD"]);

export const createOrderSchema = z
  .object({
    productSlug: z.string().trim().min(1).max(120),
    paymentMethod: paymentMethodSchema,
    document: z
      .string()
      .trim()
      .min(11)
      .max(18)
      .refine((v) => {
        const d = digitsOnly(v);
        return d.length === 11;
      }, "Informe um CPF válido (11 dígitos)."),
    phone: z
      .string()
      .trim()
      .min(10)
      .max(20)
      .refine((v) => {
        const d = digitsOnly(v);
        return d.length === 10 || d.length === 11 || d.length === 13;
      }, "Informe telefone com DDD."),
    cardToken: z.string().trim().max(512).optional(),
    installments: z.number().int().min(1).max(12).optional(),
    billingLine1: z.string().trim().max(256).optional(),
    billingZipCode: z.string().trim().max(16).optional(),
    billingCity: z.string().trim().max(64).optional(),
    billingState: z.string().trim().max(2).optional(),
    utmSource: z.string().trim().max(120).optional(),
    utmMedium: z.string().trim().max(120).optional(),
    utmCampaign: z.string().trim().max(120).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "CARD" && !data.cardToken?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Token do cartão é obrigatório para pagamento no cartão.",
        path: ["cardToken"],
      });
    }

    if (data.paymentMethod === "BOLETO") {
      if (!data.billingLine1?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Endereço obrigatório para boleto.",
          path: ["billingLine1"],
        });
      }
      if (!data.billingZipCode?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "CEP obrigatório para boleto.",
          path: ["billingZipCode"],
        });
      }
      if (!data.billingCity?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Cidade obrigatória para boleto.",
          path: ["billingCity"],
        });
      }
      if (!data.billingState?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "UF obrigatória para boleto.",
          path: ["billingState"],
        });
      }
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
