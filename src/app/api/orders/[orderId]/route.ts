import { NextResponse, type NextRequest } from "next/server";

import { getSessionFromCookies } from "@/lib/auth/session";
import { getOrderForUser } from "@/lib/orders/create-checkout";

type Params = { params: Promise<{ orderId: string }> };

/**
 * GET /api/orders/[orderId] — detalhes do pedido (dono autenticado).
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const { orderId } = await params;
  const order = await getOrderForUser(orderId, session.sub);

  if (!order) {
    return NextResponse.json(
      { ok: false, error: "Pedido não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      status: order.status,
      amountCents: order.amountCents,
      paymentMethod: order.paymentMethod,
      paymentPayload: order.paymentPayload,
      createdAt: order.createdAt.toISOString(),
      product: order.product,
    },
  });
}
