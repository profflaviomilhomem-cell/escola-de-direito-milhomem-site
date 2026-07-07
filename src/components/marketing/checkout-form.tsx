"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { UTM_STORAGE_KEY, type UtmFields } from "@/lib/orders/utm";

type Props = {
  productSlug: string;
  productName: string;
  priceLabel: string;
  userName: string;
  userEmail: string;
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
  userName,
  userEmail,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "BOLETO">("PIX");
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

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productSlug,
          paymentMethod,
          document,
          phone,
          billingLine1: paymentMethod === "BOLETO" ? billingLine1 : undefined,
          billingZipCode:
            paymentMethod === "BOLETO" ? billingZipCode : undefined,
          billingCity: paymentMethod === "BOLETO" ? billingCity : undefined,
          billingState: paymentMethod === "BOLETO" ? billingState : undefined,
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
          {(["PIX", "BOLETO"] as const).map((method) => (
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
              <span className="text-paper font-mono text-sm">{method}</span>
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
            className="border-paper-100 bg-carbon text-paper focus:border-amber w-full border px-3 py-2.5 outline-none"
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
            className="border-paper-100 bg-carbon text-paper focus:border-amber w-full border px-3 py-2.5 outline-none"
            placeholder="(61) 99999-9999"
          />
        </label>
      </div>

      {paymentMethod === "BOLETO" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-paper-700 mb-1 block text-sm">Endereço</span>
            <input
              required
              value={billingLine1}
              onChange={(e) => setBillingLine1(e.target.value)}
              className="border-paper-100 bg-carbon text-paper focus:border-amber w-full border px-3 py-2.5 outline-none"
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
              className="border-paper-100 bg-carbon text-paper focus:border-amber w-full border px-3 py-2.5 outline-none"
              placeholder="70000-000"
            />
          </label>
          <label className="block">
            <span className="text-paper-700 mb-1 block text-sm">Cidade</span>
            <input
              required
              value={billingCity}
              onChange={(e) => setBillingCity(e.target.value)}
              className="border-paper-100 bg-carbon text-paper focus:border-amber w-full border px-3 py-2.5 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-paper-700 mb-1 block text-sm">UF</span>
            <input
              required
              maxLength={2}
              value={billingState}
              onChange={(e) => setBillingState(e.target.value.toUpperCase())}
              className="border-paper-100 bg-carbon text-paper focus:border-amber w-full border px-3 py-2.5 outline-none"
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
          className="bg-amber text-paper hover:bg-amber-soft px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase transition-colors disabled:opacity-60"
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
