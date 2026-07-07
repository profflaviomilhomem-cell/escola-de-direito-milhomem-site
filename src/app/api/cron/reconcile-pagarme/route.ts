import { NextResponse, type NextRequest } from "next/server";

import { reconcilePendingOrders } from "@/lib/orders/reconcile";
import { isPagarmeConfigured } from "@/lib/pagarme/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/reconcile-pagarme — reconcilia pedidos PENDING contra o
 * Pagar.me (livro-guia 4.7 / 8.10 Risco 1).
 *
 * Acionado pelo Vercel Cron (vercel.json). O Vercel envia
 * `Authorization: Bearer <CRON_SECRET>`; sem o secret ou com header errado,
 * responde 401 (nunca roda aberto). Sem PAGARME_SECRET_KEY, responde 200
 * no-op {skipped:true} — ambiente sem chave não é erro.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: "Não autorizado." },
      { status: 401 },
    );
  }

  if (!isPagarmeConfigured()) {
    return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
  }

  try {
    const summary = await reconcilePendingOrders({ now: new Date() });
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error("[cron/reconcile-pagarme] falha:", err);
    return NextResponse.json(
      { ok: false, error: "Falha ao reconciliar pedidos." },
      { status: 500 },
    );
  }
}
