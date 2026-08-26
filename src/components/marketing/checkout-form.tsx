"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { UTM_STORAGE_KEY, type UtmFields } from "@/lib/orders/utm";
import { buildInstallmentPlan } from "@/lib/pagarme/installments";
import { isCardEnabled, tokenizeCard } from "@/lib/pagarme/tokenize-card";

type Props = {
  productSlug: string;
  productName: string;
  priceLabel: string;
  /** Preço em centavos — base do plano de parcelas do cartão. */
  priceCents: number;
  userName: string;
  userEmail: string;
};

type PaymentMethod = "PIX" | "BOLETO" | "CARD";

/** Rótulo humano. O `value` continua sendo o enum que o backend espera. */
const METHOD_LABEL: Record<PaymentMethod, string> = {
  PIX: "PIX",
  BOLETO: "BOLETO",
  CARD: "CARTÃO",
};

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "error"; message: string };

function readStoredUtm(): UtmFields {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmFields;
  } catch {
    return {};
  }
}

export function CheckoutForm({
  productSlug,
  productName,
  priceLabel,
  priceCents,
  userName,
  userEmail,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  // O cartão só aparece se houver chave pública do Pagar.me. Sem a conta do
  // professor, oferecer a opção seria mandar o comprador para uma porta que
  // não abre — o mesmo erro que o checkout já cometia com "garantir vaga".
  const [cardOn] = useState(isCardEnabled);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState(1);
  const plano = buildInstallmentPlan(priceCents);
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [billingLine1, setBillingLine1] = useState("");
  const [billingZipCode, setBillingZipCode] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  // Lazy: SSR-safe (readStoredUtm devolve {} sem window) e o valor não é
  // renderizado — só entra no corpo do POST.
  const [utm] = useState<UtmFields>(readStoredUtm);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ state: "submitting" });

    // Cartão: o número é trocado por um token direto com o Pagar.me, no
    // browser. Nada de dado de cartão entra no POST abaixo.
    let cardToken: string | undefined;
    if (paymentMethod === "CARD") {
      const r = await tokenizeCard({
        number: cardNumber,
        holderName: cardHolder,
        expMonth: cardExpMonth,
        expYear: cardExpYear,
        cvv: cardCvv,
      });
      if (!r.ok) {
        setStatus({ state: "error", message: r.error });
        return;
      }
      cardToken = r.token;
    }

    // Endereço vale para boleto (obrigatório no schema) e para cartão, onde
    // ajuda a antifraude do adquirente.
    const comEndereco = paymentMethod === "BOLETO" || paymentMethod === "CARD";

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productSlug,
          paymentMethod,
          document,
          phone,
          cardToken,
          installments: paymentMethod === "CARD" ? installments : undefined,
          billingLine1: comEndereco ? billingLine1 : undefined,
          billingZipCode: comEndereco ? billingZipCode : undefined,
          billingCity: comEndereco ? billingCity : undefined,
          billingState: comEndereco ? billingState : undefined,
          ...utm,
        }),
      });

      const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        redirectTo?: string;
        orderId?: string;
      } | null;

      if (res.status === 401) {
        router.push(
          `/entrar?from=${encodeURIComponent(`/checkout/${productSlug}`)}`,
        );
        return;
      }

      if (!res.ok || !body?.ok) {
        setStatus({
          state: "error",
          message: body?.error ?? "Não foi possível iniciar o pagamento.",
        });
        return;
      }

      track(ANALYTICS_EVENTS.CART_INITIATED, {
        product_slug: productSlug,
        payment_method: paymentMethod,
      });

      router.push(body.redirectTo ?? `/checkout/resultado/${body.orderId}`);
      router.refresh();
    } catch {
      setStatus({
        state: "error",
        message: "Sem conexão. Tente novamente em instantes.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="border-paper-100 bg-carbon-elevated border p-6">
        <p className="text-amber fm-mono text-[10px] tracking-[0.2em] uppercase">
          Resumo
        </p>
        <h2 className="text-paper mt-2 font-serif text-2xl">{productName}</h2>
        <p className="text-paper-700 mt-2 text-sm">
          Comprador: {userName} · {userEmail}
        </p>
        <p className="text-amber fm-mono mt-4 text-lg">{priceLabel}</p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-paper fm-mono text-[11px] tracking-[0.2em] uppercase">
          Forma de pagamento
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(cardOn
            ? (["PIX", "BOLETO", "CARD"] as const)
            : (["PIX", "BOLETO"] as const)
          ).map((method) => (
            <label
              key={method}
              className={`border-paper-100 cursor-pointer border px-4 py-3 transition-colors ${
                paymentMethod === method
                  ? "border-amber bg-amber/10"
                  : "hover:border-amber/40"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method)}
                className="sr-only"
              />
              <span className="text-paper font-mono text-sm">
                {METHOD_LABEL[method]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-paper-700 mb-1 block text-sm">CPF</span>
          <input
            required
            inputMode="numeric"
            autoComplete="off"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
            placeholder="000.000.000-00"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-paper-700 mb-1 block text-sm">
            Celular (DDD + número)
          </span>
          <input
            required
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
            placeholder="(61) 99999-9999"
          />
        </label>
      </div>

      {paymentMethod === "CARD" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-paper-700 mb-1 block text-sm">
              Número do cartão
            </span>
            <input
              required
              inputMode="numeric"
              autoComplete="cc-number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              placeholder="0000 0000 0000 0000"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-paper-700 mb-1 block text-sm">
              Nome como está no cartão
            </span>
            <input
              required
              autoComplete="cc-name"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              placeholder="FLAVIO MILHOMEM"
            />
          </label>
          <label className="block">
            <span className="text-paper-700 mb-1 block text-sm">
              Validade (mês)
            </span>
            <input
              required
              inputMode="numeric"
              autoComplete="cc-exp-month"
              maxLength={2}
              value={cardExpMonth}
              onChange={(e) => setCardExpMonth(e.target.value)}
              className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              placeholder="12"
            />
          </label>
          <label className="block">
            <span className="text-paper-700 mb-1 block text-sm">
              Validade (ano)
            </span>
            <input
              required
              inputMode="numeric"
              autoComplete="cc-exp-year"
              maxLength={4}
              value={cardExpYear}
              onChange={(e) => setCardExpYear(e.target.value)}
              className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              placeholder="2030"
            />
          </label>
          <label className="block">
            <span className="text-paper-700 mb-1 block text-sm">CVV</span>
            <input
              required
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value)}
              className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              placeholder="123"
            />
          </label>
          <label className="block">
            <span className="text-paper-700 mb-1 block text-sm">Parcelas</span>
            <select
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {plano.map((opcao) => (
                <option key={opcao.installments} value={opcao.installments}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {paymentMethod === "BOLETO" || paymentMethod === "CARD" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-paper-700 mb-1 block text-sm">Endereço</span>
            <input
              required
              value={billingLine1}
              onChange={(e) => setBillingLine1(e.target.value)}
              className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              placeholder="Rua, número, bairro"
            />
          </label>
          <label className="block">
            <span className="text-paper-700 mb-1 block text-sm">CEP</span>
            <input
              required
              inputMode="numeric"
              value={billingZipCode}
              onChange={(e) => setBillingZipCode(e.target.value)}
              className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              placeholder="70000-000"
            />
          </label>
          <label className="block">
            <span className="text-paper-700 mb-1 block text-sm">Cidade</span>
            <input
              required
              value={billingCity}
              onChange={(e) => setBillingCity(e.target.value)}
              className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </label>
          <label className="block">
            <span className="text-paper-700 mb-1 block text-sm">UF</span>
            <input
              required
              maxLength={2}
              value={billingState}
              onChange={(e) => setBillingState(e.target.value.toUpperCase())}
              className="border-paper-100 bg-carbon text-paper focus:border-amber focus-visible:outline-amber w-full border px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              placeholder="DF"
            />
          </label>
        </div>
      ) : null}

      {status.state === "error" ? (
        <p className="text-sm text-red-400" role="alert">
          {status.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status.state === "submitting"}
          className="bg-amber text-carbon hover:bg-amber-soft px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase transition-colors disabled:opacity-60"
        >
          {status.state === "submitting" ? "Processando…" : "Pagar agora"}
        </button>
        <Link
          href={`/cursos/${productSlug}`}
          className="text-paper-600 hover:text-amber text-sm underline-offset-2 hover:underline"
        >
          Voltar ao curso
        </Link>
      </div>

      <p className="text-paper-600 text-xs leading-relaxed">
        Pagamento processado pela Pagar.me. Ao confirmar, você concorda com os{" "}
        <Link
          href="/termos"
          className="text-amber underline-offset-2 hover:underline"
        >
          termos
        </Link>{" "}
        e a{" "}
        <Link
          href="/reembolso"
          className="text-amber underline-offset-2 hover:underline"
        >
          política de reembolso
        </Link>
        .
      </p>
    </form>
  );
}
