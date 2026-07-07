import { NextResponse, type NextRequest } from "next/server";

import { advanceDueSends } from "@/lib/email/sequences";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/email-sequences — drena os envios vencidos das sequências.
 *
 * Acionado pelo Vercel Cron (vercel.json, de hora em hora). O Vercel Cron
 * envia `Authorization: Bearer <CRON_SECRET>`; sem o secret configurado ou
 * com header errado, responde 401 (nunca roda aberto).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: "Não autorizado." },
      {
        status: 401,
      },
    );
  }

  try {
    const summary = await advanceDueSends();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error("[cron/email-sequences] falha:", err);
    return NextResponse.json(
      { ok: false, error: "Falha ao drenar sequências." },
      { status: 500 },
    );
  }
}
