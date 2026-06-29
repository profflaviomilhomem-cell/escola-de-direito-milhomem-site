import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSessionFromCookies } from "@/lib/auth/session";
import { PagarmeApiError } from "@/lib/pagarme/client";
import { isPagarmeConfigured, refundPagarmeCharge } from "@/lib/pagarme/refund";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/upstash/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/refunds — APROVAÇÃO/EXECUÇÃO de reembolso (admin).
 *
 * Conecta a aprovação interna à API de estorno do Pagar.me. É a etapa final
 * do fluxo de reembolso (a solicitação do aluno hoje chega por e-mail, ver
 * /reembolso). GATED em duas camadas:
 *   1. sessão com role=admin (senão 401/403);
 *   2. PAGARME_SECRET_KEY presente (senão 503) — nunca estorna sem chave.
 *
 * Estorno parcial: passe `amountCents` (centavos) conforme a política
 * proporcional; omita para estorno integral.
 */
const bodySchema = z.object({
  orderId: z.string().trim().min(1),
  amountCents: z.number().int().positive().optional(),
  reason: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Não autorizado." },
      { status: 401 },
    );
  }
  if (session.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Apenas administradores podem aprovar reembolsos." },
      { status: 403 },
    );
  }

  // Gate de configuração: sem chave, não executa — responde de forma clara.
  if (!isPagarmeConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Reembolso indisponível: PAGARME_SECRET_KEY não configurada neste ambiente.",
      },
      { status: 503 },
    );
  }

  const rl = await rateLimit({
    prefix: "admin:refund",
    max: 30,
    window: "10 m",
    key: session.sub,
  });
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: "Muitas operações em pouco tempo. Aguarde." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload inválido." },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    select: {
      id: true,
      status: true,
      amountCents: true,
      pagarmeChargeId: true,
    },
  });
  if (!order) {
    return NextResponse.json(
      { ok: false, error: "Pedido não encontrado." },
      { status: 404 },
    );
  }
  if (order.status !== "PAID") {
    return NextResponse.json(
      {
        ok: false,
        error: `Pedido não é reembolsável (status ${order.status}).`,
      },
      { status: 409 },
    );
  }
  if (!order.pagarmeChargeId) {
    return NextResponse.json(
      { ok: false, error: "Pedido sem cobrança Pagar.me associada." },
      { status: 409 },
    );
  }
  if (
    parsed.data.amountCents != null &&
    parsed.data.amountCents > order.amountCents
  ) {
    return NextResponse.json(
      { ok: false, error: "Valor de estorno maior que o valor do pedido." },
      { status: 422 },
    );
  }

  try {
    const charge = await refundPagarmeCharge(
      order.pagarmeChargeId,
      parsed.data.amountCents,
    );

    // Otimista: o webhook charge.refunded confirma de novo (updateMany idempotente).
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "REFUNDED" },
    });

    return NextResponse.json({
      ok: true,
      chargeId: charge.id ?? order.pagarmeChargeId,
    });
  } catch (err) {
    if (err instanceof PagarmeApiError) {
      return NextResponse.json(
        { ok: false, error: `Pagar.me recusou o estorno: ${err.message}` },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Falha ao processar o estorno." },
      { status: 500 },
    );
  }
}
