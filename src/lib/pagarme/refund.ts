import { pagarmeRequest } from "@/lib/pagarme/client";
import { isPagarmeConfigured } from "@/lib/pagarme/config";
import type { PagarmeCharge } from "@/lib/pagarme/types";

/**
 * Reembolso (estorno) de uma cobrança no Pagar.me v5.
 *
 * Na API v5 o estorno é `DELETE /charges/:id`; com `amount` no corpo faz
 * estorno PARCIAL (em centavos), sem `amount` estorna o valor integral.
 *
 * GATED: sem `PAGARME_SECRET_KEY` a função lança erro de configuração — o
 * caller (rota admin) deve checar `isPagarmeConfigured()` antes e responder
 * 503 amigável. Nunca executa nada em ambiente sem chave.
 */
export async function refundPagarmeCharge(
  chargeId: string,
  amountCents?: number,
): Promise<PagarmeCharge> {
  if (!chargeId.trim()) {
    throw new Error("chargeId ausente para estorno.");
  }
  if (
    amountCents != null &&
    (!Number.isInteger(amountCents) || amountCents <= 0)
  ) {
    throw new Error("amountCents de estorno inválido.");
  }

  return pagarmeRequest<PagarmeCharge>(`/charges/${chargeId}`, {
    method: "DELETE",
    ...(amountCents != null
      ? { body: JSON.stringify({ amount: amountCents }) }
      : {}),
  });
}

export { isPagarmeConfigured };

/**
 * Valor reembolsável segundo a Política de Reembolso (/reembolso):
 *  - até 15 dias: 100% (integral, incondicional);
 *  - 16–90 dias, por % de conteúdo consumido:
 *      <30% → 70% · 30–60% → 40% · >60% → 0%;
 *  - após 90 dias: 0% (caso a caso, fora do automático).
 *
 * Puro e determinístico — testável sem rede. Retorna centavos (arredonda).
 */
export function refundableAmountCents(input: {
  amountCents: number;
  daysSincePurchase: number;
  contentConsumedPct: number; // 0..100
}): number {
  const { amountCents, daysSincePurchase, contentConsumedPct } = input;
  if (amountCents <= 0) return 0;

  if (daysSincePurchase <= 15) return amountCents; // integral incondicional
  if (daysSincePurchase > 90) return 0;

  let factor: number;
  if (contentConsumedPct <= 30) factor = 0.7;
  else if (contentConsumedPct <= 60) factor = 0.4;
  else factor = 0;

  return Math.round(amountCents * factor);
}
