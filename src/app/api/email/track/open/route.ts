import { NextResponse, type NextRequest } from "next/server";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server-track";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GIF transparente 1x1 (a menor imagem válida).
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

/**
 * GET /api/email/track/open?e=&s=&step= — pixel de abertura (sequence_opened).
 * Registra o evento (best-effort) e devolve o gif 1x1, sempre sem cache.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const email = sp.get("e");
  const sequence = sp.get("s");
  const step = Number(sp.get("step") ?? "0");

  if (email && sequence) {
    void trackServerEvent(ANALYTICS_EVENTS.SEQUENCE_OPENED, {
      userId: email,
      sequence,
      step: Number.isFinite(step) ? step : 0,
    });
  }

  return new NextResponse(new Uint8Array(PIXEL), {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
    },
  });
}
