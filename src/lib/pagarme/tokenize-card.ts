/**
 * Tokenização do cartão, no browser.
 *
 * Regra que não se negocia: **o número do cartão nunca chega ao nosso
 * servidor.** O browser troca os dados do cartão por um token direto com o
 * Pagar.me, usando a chave pública, e só esse token entra no POST de
 * `/api/orders/create`. É por isso que `createOrderSchema` pede `cardToken` e
 * não pede número — o schema já estava certo desde sempre; faltava o pedaço
 * do browser.
 *
 * Consequência prática: nenhum campo de cartão pode ter `name` que o browser
 * mande junto num submit normal, e o formulário chama esta função antes de
 * qualquer `fetch` nosso.
 *
 * Sem `NEXT_PUBLIC_PAGARME_PUBLIC_KEY` a função devolve erro explicado, e a
 * tela some com a opção de cartão. Hoje é esse o caso: a conta Pagar.me do
 * Flávio ainda não existe.
 */

const TOKEN_ENDPOINT = "https://api.pagar.me/core/v5/tokens";

export type CardInput = {
  number: string;
  holderName: string;
  /** "MM" */
  expMonth: string;
  /** "AA" ou "AAAA" */
  expYear: string;
  cvv: string;
};

export type TokenizeResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

export function pagarmePublicKey(): string {
  return process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY ?? "";
}

export function isCardEnabled(): boolean {
  return pagarmePublicKey().trim().length > 0;
}

export function onlyDigits(v: string): string {
  return v.replace(/\D+/g, "");
}

/** Luhn. Pega o dígito trocado antes de gastar uma ida à rede. */
export function isValidCardNumber(raw: string): boolean {
  const num = onlyDigits(raw);
  if (num.length < 13 || num.length > 19) return false;

  let soma = 0;
  let dobra = false;
  for (let i = num.length - 1; i >= 0; i -= 1) {
    let d = num.charCodeAt(i) - 48;
    if (dobra) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    soma += d;
    dobra = !dobra;
  }
  return soma % 10 === 0;
}

/** Normaliza "26" e "2026" para o ano de quatro dígitos que a API espera. */
export function normalizeExpYear(raw: string): string {
  const d = onlyDigits(raw);
  if (d.length === 4) return d;
  if (d.length === 2) return `20${d}`;
  return "";
}

export function isExpired(
  expMonth: string,
  expYear: string,
  now: Date = new Date(),
): boolean {
  const mes = Number(onlyDigits(expMonth));
  const ano = Number(normalizeExpYear(expYear));
  if (!mes || mes < 1 || mes > 12 || !ano) return true;
  // Cartão vale até o último dia do mês impresso.
  const ultimoInstante = new Date(ano, mes, 1).getTime() - 1;
  return now.getTime() > ultimoInstante;
}

export function validateCard(
  card: CardInput,
  now: Date = new Date(),
): string | null {
  if (!isValidCardNumber(card.number)) return "Número do cartão inválido.";
  if (card.holderName.trim().length < 3)
    return "Informe o nome como está no cartão.";
  if (isExpired(card.expMonth, card.expYear, now))
    return "Cartão vencido ou validade inválida.";
  const cvv = onlyDigits(card.cvv);
  if (cvv.length < 3 || cvv.length > 4) return "CVV inválido.";
  return null;
}

/**
 * Troca os dados do cartão por um token do Pagar.me.
 *
 * Só roda no browser — chamar no servidor é erro de uso, não de configuração,
 * e por isso falha explicitamente.
 */
export async function tokenizeCard(
  card: CardInput,
  now: Date = new Date(),
): Promise<TokenizeResult> {
  if (typeof window === "undefined") {
    return {
      ok: false,
      error: "Tokenização de cartão só pode acontecer no navegador.",
    };
  }

  const appId = pagarmePublicKey().trim();
  if (!appId) {
    return {
      ok: false,
      error: "Pagamento no cartão indisponível no momento.",
    };
  }

  const invalido = validateCard(card, now);
  if (invalido) return { ok: false, error: invalido };

  let res: Response;
  try {
    res = await fetch(`${TOKEN_ENDPOINT}?appId=${encodeURIComponent(appId)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "card",
        card: {
          number: onlyDigits(card.number),
          holder_name: card.holderName.trim(),
          exp_month: Number(onlyDigits(card.expMonth)),
          exp_year: Number(normalizeExpYear(card.expYear)),
          cvv: onlyDigits(card.cvv),
        },
      }),
    });
  } catch {
    return { ok: false, error: "Sem conexão para validar o cartão." };
  }

  if (!res.ok) {
    // A mensagem do adquirente pode conter dado do portador — não repassamos.
    return {
      ok: false,
      error:
        "Não foi possível validar o cartão. Confira os dados e tente novamente.",
    };
  }

  const body = (await res.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) {
    return { ok: false, error: "Resposta inesperada ao validar o cartão." };
  }

  return { ok: true, token: body.id };
}
