import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import type { CheckoutPaymentPayload } from "@/lib/pagarme/map-status";
import { getSubscriptionForUser } from "@/lib/pagarme/subscription-sync";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getOrderForUser } from "@/lib/orders/create-checkout";
import { TrackEvent } from "@/components/shared/track-event";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { formatBRLFromCents } from "@/lib/utils";

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ status?: string; kind?: string }>;
};

export const metadata: Metadata = {
  title: "Resultado do pagamento",
  robots: { index: false, follow: false },
};

export default async function CheckoutResultadoPage({
  params,
  searchParams,
}: Props) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/entrar");

  const { orderId } = await params;
  const { status: statusHint, kind } = await searchParams;

  if (kind === "subscription") {
    const subscription = await getSubscriptionForUser(orderId, session.sub);
    if (!subscription) notFound();

    const isSuccess =
      subscription.status === "ACTIVE" ||
      statusHint === "sucesso" ||
      statusHint === "success";
    const isPending =
      subscription.status === "PAUSED" ||
      subscription.status === "PAST_DUE" ||
      statusHint === "pendente" ||
      statusHint === "pending";
    const isRefused =
      subscription.status === "CANCELED" ||
      statusHint === "recusado" ||
      statusHint === "failed";

    return (
      <section className="fm-site-page py-page max-w-2xl">
        <p className="text-amber fm-mono text-[11px] tracking-[0.22em] uppercase">
          Assinatura
        </p>

        {isSuccess ? (
          <>
            <h1 className="text-paper mt-3 font-serif text-3xl">
              Assinatura ativa
            </h1>
            <p className="text-paper-700 mt-4 leading-relaxed">
              Sua assinatura em <strong>{subscription.product.name}</strong>{" "}
              está ativa. Acesse o conteúdo na área do aluno.
            </p>
            <Link
              href={`/aluno/cursos/${subscription.product.slug}`}
              className="bg-amber text-paper mt-8 inline-block px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase"
            >
              Ir para o conteúdo
            </Link>
          </>
        ) : isPending ? (
          <>
            <h1 className="text-paper mt-3 font-serif text-3xl">
              Aguardando pagamento
            </h1>
            <p className="text-paper-700 mt-4 leading-relaxed">
              Assinatura de{" "}
              {formatBRLFromCents(subscription.product.priceCents)} em{" "}
              <strong>{subscription.product.name}</strong>. Assim que o Pagar.me
              confirmar a primeira cobrança, liberamos o acesso automaticamente.
            </p>
            <p className="text-paper-600 mt-6 text-sm">
              Se pagou com boleto, o prazo de compensação pode levar até 3 dias
              úteis.
            </p>
          </>
        ) : isRefused ? (
          <>
            <h1 className="text-paper mt-3 font-serif text-3xl">
              Assinatura não concluída
            </h1>
            <p className="text-paper-700 mt-4 leading-relaxed">
              Não foi possível ativar a assinatura. Tente novamente ou escolha
              outra forma de pagamento.
            </p>
            <Link
              href={`/checkout/${subscription.product.slug}`}
              className="bg-amber text-paper mt-8 inline-block px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase"
            >
              Tentar de novo
            </Link>
          </>
        ) : (
          <>
            <TrackEvent
              event={ANALYTICS_EVENTS.PURCHASE_COMPLETED}
              once={`subscription:${subscription.id}`}
              props={{
                subscription_id: subscription.id,
                product_slug: subscription.product.slug,
                kind: "subscription",
                currency: "BRL",
              }}
            />
            <h1 className="text-paper mt-3 font-serif text-3xl">
              Assinatura registrada
            </h1>
            <p className="text-paper-700 mt-4 leading-relaxed">
              Status atual:{" "}
              <span className="font-mono">{subscription.status}</span>
            </p>
          </>
        )}
      </section>
    );
  }

  const order = await getOrderForUser(orderId, session.sub);
  if (!order) notFound();

  const payment = order.paymentPayload as CheckoutPaymentPayload | null;
  const isSuccess =
    order.status === "PAID" ||
    statusHint === "sucesso" ||
    statusHint === "success";
  const isPending =
    order.status === "PENDING" ||
    statusHint === "pendente" ||
    statusHint === "pending";
  const isRefused =
    order.status === "REFUSED" ||
    statusHint === "recusado" ||
    statusHint === "failed";

  return (
    <section className="fm-site-page py-page max-w-2xl">
      <p className="text-amber fm-mono text-[11px] tracking-[0.22em] uppercase">
        Pagamento
      </p>

      {isSuccess ? (
        <>
          <TrackEvent
            event={ANALYTICS_EVENTS.PURCHASE_COMPLETED}
            once={`purchase:${order.id}`}
            props={{
              order_id: order.id,
              product_slug: order.product.slug,
              value: order.amountCents / 100,
              currency: "BRL",
              payment_method: order.paymentMethod,
            }}
          />
          <h1 className="text-paper mt-3 font-serif text-3xl">
            Pagamento confirmado
          </h1>
          <p className="text-paper-700 mt-4 leading-relaxed">
            Sua matrícula em <strong>{order.product.name}</strong> está ativa.
            Acesse o curso na área do aluno.
          </p>
          <Link
            href={`/aluno/cursos/${order.product.slug}`}
            className="bg-amber text-paper mt-8 inline-block px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase"
          >
            Ir para o curso
          </Link>
        </>
      ) : isPending ? (
        <>
          <h1 className="text-paper mt-3 font-serif text-3xl">
            Aguardando pagamento
          </h1>
          <p className="text-paper-700 mt-4 leading-relaxed">
            Pedido de {formatBRLFromCents(order.amountCents)} em{" "}
            <strong>{order.product.name}</strong>. Assim que o Pagar.me
            confirmar, liberamos o acesso automaticamente.
          </p>

          {payment?.pixQrCode ? (
            <div className="border-paper-100 bg-carbon-elevated mt-8 border p-5">
              <p className="text-amber fm-mono text-[10px] tracking-[0.2em] uppercase">
                PIX copia e cola
              </p>
              <p className="text-paper-800 mt-3 font-mono text-xs leading-relaxed break-all">
                {payment.pixQrCode}
              </p>
              {payment.pixQrCodeUrl ? (
                <a
                  href={payment.pixQrCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber mt-4 inline-block text-sm underline-offset-2 hover:underline"
                >
                  Abrir QR Code
                </a>
              ) : null}
            </div>
          ) : null}

          {payment?.boletoLine ? (
            <div className="border-paper-100 bg-carbon-elevated mt-8 border p-5">
              <p className="text-amber fm-mono text-[10px] tracking-[0.2em] uppercase">
                Linha digitável
              </p>
              <p className="text-paper-800 mt-3 font-mono text-xs break-all">
                {payment.boletoLine}
              </p>
              {payment.boletoPdf ? (
                <a
                  href={payment.boletoPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber mt-4 inline-block text-sm underline-offset-2 hover:underline"
                >
                  Baixar boleto (PDF)
                </a>
              ) : null}
            </div>
          ) : null}

          <p className="text-paper-600 mt-6 text-sm">
            Você também encontra este pedido em{" "}
            <Link
              href="/aluno/minha-conta"
              className="text-amber hover:underline"
            >
              Minha conta
            </Link>
            .
          </p>
        </>
      ) : isRefused ? (
        <>
          <h1 className="text-paper mt-3 font-serif text-3xl">
            Pagamento não concluído
          </h1>
          <p className="text-paper-700 mt-4 leading-relaxed">
            Não foi possível confirmar o pagamento. Tente novamente ou escolha
            outra forma de pagamento.
          </p>
          <Link
            href={`/checkout/${order.product.slug}`}
            className="bg-amber text-paper mt-8 inline-block px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase"
          >
            Tentar de novo
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-paper mt-3 font-serif text-3xl">
            Pedido registrado
          </h1>
          <p className="text-paper-700 mt-4 leading-relaxed">
            Status atual: <span className="font-mono">{order.status}</span>
          </p>
        </>
      )}
    </section>
  );
}
