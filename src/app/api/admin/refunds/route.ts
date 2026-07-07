import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSessionFromCookies } from "@/lib/auth/session";
import { PagarmeApiError } from "@/lib/pagarme/client";
import { isPagarmeConfigured, refundPagarmeCharge } from "@/lib/pagarme/refund";
import { prisma } from "@/lib/prisma";
import {
  approveRefundRequest,
  rejectRefundRequest,
} from "@/lib/refunds/decide";
import { listOpenRefundRequests } from "@/lib/refunds/summary";
import { rateLimit } from "@/lib/upstash/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fila e decisão de reembolsos (admin) — livro-guia 4.7.
 *
 * GET  → lista solicitações em aberto (REQUESTED/APPROVED) para revisão.
 * POST → decide uma solicitação (approve/reject) OU executa estorno direto
 *        (contrato legado por orderId, mantido para operação manual).
 *
 * GATED em duas camadas: sessão role=admin (401/403) e, no caminho que estorna,
 * PAGARME_SECRET_KEY presente (503) — nunca estorna sem chave.
 */

async function requireAdmin() {
  const session = await getSessionFromCookies();
  if (!session) {
    return {
      error: NextResponse.json(
        { ok: false, error: "Não autorizado." },
        { status: 401 },
      ),
    };
  }
  if (session.role !== "admin") {
    return {
      error: NextResponse.json(
        {
          ok: false,
          error: "Apenas administradores podem operar reembolsos.",
        },
        { status: 403 },
      ),
    };
  }
  return { session };
}

export async function GET() {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  try {
    const requests = await listOpenRefundRequests();
    return NextResponse.json({ ok: true, requests });
  } catch (err) {
    console.error("[api/admin/refunds] GET falha:", err);
    return NextResponse.json(
      { ok: false, error: "Banco indisponível." },
      { status: 503 },
    );
  }
}

const decisionSchema = z.object({
  refundRequestId: z.string().trim().min(1),
  decision: z.enum(["approve", "reject"]),
  amountCents: z.number().int().positive().optional(),
});

const legacySchema = z.object({
  orderId: z.string().trim().min(1),
  amountCents: z.number().int().positive().optional(),
  reason: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  const session = gate.session;

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

  const hasRequestId =
    typeof raw === "object" && raw !== null && "refundRequestId" in raw;

  // Caminho 1 — decisão sobre uma solicitação do aluno (approve/reject).
  if (hasRequestId) {
    const parsed = decisionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, errors: z.flattenError(parsed.error) },
        { status: 422 },
      );
    }

    if (parsed.data.decision === "reject") {
      const result = await rejectRefundRequest({
        refundRequestId: parsed.data.refundRequestId,
        decidedByUserId: session.sub,
        now: new Date(),
      });
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.message },
          { status: result.httpStatus },
        );
      }
      return NextResponse.json({ ok: true, status: result.status });
    }

    // approve → estorna: exige chave.
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

    const result = await approveRefundRequest({
      refundRequestId: parsed.data.refundRequestId,
      decidedByUserId: session.sub,
      now: new Date(),
      amountCentsOverride: parsed.data.amountCents,
    });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.message },
        { status: result.httpStatus },
      );
    }
    return NextResponse.json({
      ok: true,
      status: result.status,
      chargeId: result.chargeId,
    });
  }

  // Caminho 2 — estorno direto por orderId (operação manual, contrato legado).
  const parsed = legacySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

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
