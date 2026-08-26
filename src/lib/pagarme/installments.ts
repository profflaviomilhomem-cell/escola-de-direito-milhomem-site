/**
 * Plano de parcelas do cartão.
 *
 * O Livro-Guia previa "12× sem juros" desde o começo, e o backend já aceitava
 * `installments` — mas a tela nunca ofereceu cartão, então este cálculo não
 * existia em lugar nenhum.
 *
 * Duas regras que parecem detalhe e não são:
 *
 * 1. **Centavo não some.** 29700 / 7 = 4242,857…  Dividir e arredondar cada
 *    parcela gera 7 × 4243 = 29701 — um centavo a mais do que o comprador
 *    aceitou pagar. A conta aqui distribui o resto na **primeira** parcela,
 *    que é a convenção do mercado e a que o Pagar.me espera: a soma das
 *    parcelas é sempre exatamente o total.
 *
 * 2. **Parcela mínima.** Oferecer 12× de R$ 3,50 é ruído na tela e costuma ser
 *    recusado pelo adquirente. O piso corta as opções que não fazem sentido.
 *
 * Sem juros: o total não muda com o número de parcelas. Se um dia houver juros,
 * é aqui que entram — e os testes desta função são o lugar de provar.
 */

/** Piso de parcela, em centavos. R$ 5,00 é a convenção usual do mercado. */
export const MIN_INSTALLMENT_CENTS = 500;

/** Teto do schema de pedido (`installments: z.number().int().min(1).max(12)`). */
export const MAX_INSTALLMENTS = 12;

export type InstallmentOption = {
  /** Número de parcelas. */
  installments: number;
  /** Valor da primeira parcela, em centavos — absorve o resto da divisão. */
  firstCents: number;
  /** Valor de cada uma das demais, em centavos. */
  restCents: number;
  /** Total cobrado, em centavos. Sem juros, é igual ao preço. */
  totalCents: number;
  /** Rótulo pronto para a tela: "12× de R$ 24,75 sem juros". */
  label: string;
};

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Monta as opções de parcelamento para um valor, da menor para a maior.
 *
 * @param amountCents preço total em centavos
 * @param maxInstallments teto desejado (limitado por `MAX_INSTALLMENTS`)
 * @param minInstallmentCents piso por parcela
 */
export function buildInstallmentPlan(
  amountCents: number,
  maxInstallments: number = MAX_INSTALLMENTS,
  minInstallmentCents: number = MIN_INSTALLMENT_CENTS,
): InstallmentOption[] {
  if (!Number.isInteger(amountCents) || amountCents <= 0) return [];

  const teto = Math.min(
    Math.max(1, Math.floor(maxInstallments)),
    MAX_INSTALLMENTS,
  );

  const opcoes: InstallmentOption[] = [];

  for (let n = 1; n <= teto; n += 1) {
    const base = Math.floor(amountCents / n);
    // Uma parcela só existe se todas ficarem no piso — inclusive a menor,
    // que é `base` (a primeira só é maior, nunca menor).
    if (n > 1 && base < minInstallmentCents) break;

    const resto = amountCents - base * n;
    const first = base + resto;

    opcoes.push({
      installments: n,
      firstCents: first,
      restCents: base,
      totalCents: amountCents,
      label:
        n === 1
          ? `À vista — ${formatBRL(amountCents)}`
          : resto === 0
            ? `${n}× de ${formatBRL(base)} sem juros`
            : `${n}× — primeira de ${formatBRL(first)}, demais de ${formatBRL(base)} sem juros`,
    });
  }

  return opcoes;
}

/** Soma de conferência: usada nos testes e barata o bastante para a UI usar. */
export function totalFromOption(option: InstallmentOption): number {
  return option.firstCents + option.restCents * (option.installments - 1);
}
