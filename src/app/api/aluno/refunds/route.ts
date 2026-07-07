import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSessionFromCookies } from "@/lib/auth/session";
import { createRefundRequest } from "@/lib/refunds/request";
import { rateLimit } from "@/lib/upstash/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/aluno/refunds — solicitação de reembolso pelo aluno (livro-guia
 * 4.7). Sessão obrigatória; a posse do pedido é validada em createRefundRequest
 * (order.userId === session.sub). Retorna o valor elegível estimado.
 */
const bodySchema = z.object({
  orderId: z.string().trim().min(1),
  reason: z.string().trim().max(1000).optional(),
});

const STATUS_BY_CODE: Record<string, number> = {
  ORDER_NOT_FOUND: 404,
  NOT_PAID: 409,
  DUPLICATE_OPEN: 409,
};

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Não autorizado." },
      { status: 401 },
    );
  }

  const rl = await rateLimit({
    prefix: "aluno:refund",
    max: 10,
    window: "10 m",
    key: session.sub,
  });
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: "Muitas solicitações em pouco tempo. Aguarde." },
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

  try {
    const result = await createRefundRequest({
      userId: session.sub,
      orderId: parsed.data.orderId,
      reason: parsed.data.reason,
      now: new Date(),
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.message, code: result.code },
        { status: STATUS_BY_CODE[result.code] ?? 409 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        requestId: result.requestId,
        eligibleAmountCents: result.eligibleAmountCents,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[api/aluno/refunds] falha:", err);
    return NextResponse.json(
      { ok: false, error: "Não foi possível registrar a solicitação." },
      { status: 503 },
    );
  }
}
