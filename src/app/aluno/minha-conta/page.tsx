import type { Metadata } from "next";

import { RefundRequestButton } from "@/components/aluno/refund-request-button";
import { UpdatePasswordForm } from "@/components/aluno/update-password-form";
import { UpdateProfileForm } from "@/components/aluno/update-profile-form";
import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { initialsFromName } from "@/lib/course/format";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/enrollment";
import {
  estimateEligibleForOrder,
  getRefundStatusByOrder,
} from "@/lib/refunds/summary";

const REFUND_STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Reembolso solicitado",
  APPROVED: "Reembolso aprovado",
  PROCESSED: "Reembolsado",
  REJECTED: "Reembolso recusado",
};

const OPEN_REFUND = new Set(["REQUESTED", "APPROVED"]);

export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false, follow: false },
};

export default async function MinhaContaPage() {
  const session = await getSessionFromCookies();
  const name = session?.name ?? "Aluno";
  const email = session?.email ?? "";
  const initials = initialsFromName(name);
  const orders = session?.sub ? await getUserOrders(session.sub) : [];

  const now = new Date();
  const refundByOrder = session?.sub
    ? await getRefundStatusByOrder(session.sub)
    : new Map();

  // Estima o valor elegível só dos pedidos PAID sem solicitação em aberto
  // (os únicos que exibem o botão de solicitar).
  const eligibleByOrder = new Map<string, number>();
  if (session?.sub) {
    for (const o of orders) {
      const refund = refundByOrder.get(o.id);
      const hasOpen = refund ? OPEN_REFUND.has(refund.status) : false;
      if (o.status === "PAID" && !hasOpen && o.product?.slug) {
        eligibleByOrder.set(
          o.id,
          await estimateEligibleForOrder({
            userId: session.sub,
            productSlug: o.product.slug,
            amountCents: o.amountCents,
            createdAt: o.createdAt,
            now,
          }),
        );
      }
    }
  }

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);

  return (
    <section className="fm-site-page py-20">
      <p className="text-amber fm-mono">Conta</p>
      <h1 className="text-paper mt-3 font-serif text-3xl md:text-4xl">
        Minha conta
      </h1>

      <div className="border-paper-100 bg-carbon-elevated mt-10 flex items-center gap-5 border p-6">
        <span className="bg-amber text-carbon grid h-14 w-14 place-items-center rounded-full font-mono text-lg font-bold">
          {initials}
        </span>
        <div>
          <p className="text-paper font-semibold">{name}</p>
          <p className="text-paper-600 mt-1 text-sm">{email}</p>
        </div>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="text-paper fm-mono text-[11px] tracking-[0.2em] uppercase">
            Dados pessoais
          </h2>
          <div className="border-paper-100 bg-carbon-elevated mt-6 border p-6">
            <UpdateProfileForm
              initialName={session?.name ?? ""}
              initialEmail={email}
            />
          </div>
        </section>
        <section>
          <h2 className="text-paper fm-mono text-[11px] tracking-[0.2em] uppercase">
            Segurança
          </h2>
          <div className="border-paper-100 bg-carbon-elevated mt-6 border p-6">
            <UpdatePasswordForm />
          </div>
        </section>
      </div>

      <h2 className="text-paper fm-mono mt-14 text-[11px] tracking-[0.2em] uppercase">
        Pedidos
      </h2>
      <div className="mt-6">
        {orders.length === 0 ? (
          <AreaEmptyState
            title="Nenhum pedido registrado"
            description="Suas compras e comprovantes de pagamento aparecerão aqui após a matrícula."
          />
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 10).map((o) => {
              const refund = refundByOrder.get(o.id);
              const hasOpen = refund ? OPEN_REFUND.has(refund.status) : false;
              const eligible = eligibleByOrder.get(o.id);
              const canRequest = o.status === "PAID" && !hasOpen;
              return (
                <div
                  key={o.id}
                  className="border-paper-100 bg-carbon-elevated border p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-paper truncate font-semibold">
                        {o.product?.name ?? o.product?.slug ?? "Produto"}
                      </p>
                      <p className="text-paper-600 fm-mono mt-1 text-sm">
                        {o.product?.slug ?? "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-paper fm-mono text-sm">
                        {formatMoney(o.amountCents)}
                      </p>
                      <p className="text-paper-600 fm-mono mt-1 text-xs">
                        status: {o.status}
                      </p>
                    </div>
                  </div>

                  {refund && (
                    <p className="text-amber fm-mono mt-3 text-xs">
                      {REFUND_STATUS_LABEL[refund.status] ?? refund.status}
                    </p>
                  )}

                  {canRequest && eligible != null && (
                    <RefundRequestButton
                      orderId={o.id}
                      eligibleAmountCents={eligible}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
