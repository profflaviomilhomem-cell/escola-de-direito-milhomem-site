import { NextResponse, type NextRequest } from "next/server";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server-track";
import { safeClickDestination } from "@/lib/email/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/email/track/click?u=&e=&s=&step= — wrapper de clique.
 * Registra sequence_clicked e redireciona ao destino, que é validado contra
 * a allowlist (anti open-redirect) antes do 302.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const dest = safeClickDestination(sp.get("u"), req.nextUrl.origin);

  if (!dest) {
    return NextResponse.json(
      { ok: false, error: "Destino inválido." },
      { status: 400 },
    );
  }

  const email = sp.get("e");
  const sequence = sp.get("s");
  const step = Number(sp.get("step") ?? "0");

  if (email && sequence) {
    void trackServerEvent(ANALYTICS_EVENTS.SEQUENCE_CLICKED, {
      userId: email,
      sequence,
      step: Number.isFinite(step) ? step : 0,
      url: dest,
    });
  }

  return NextResponse.redirect(dest, 302);
}
