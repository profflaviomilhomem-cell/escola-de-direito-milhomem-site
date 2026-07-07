import { NextResponse } from "next/server";

import { getSessionFromCookies } from "@/lib/auth/session";
import { sendCampaign } from "@/lib/email/campaign";
import { rateLimit } from "@/lib/upstash/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/**
 * POST /api/admin/email/campaign/[slug]/send — envia o boletim em lote.
 *
 * Carrega o EmailCampaign, renderiza o Markdown e envia a todos os leads
 * elegíveis (duplo opt-in, não descadastrados). GATED por sessão admin.
 */
export async function POST(_req: Request, { params }: Params) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Não autorizado." },
      {
        status: 401,
      },
    );
  }
  if (session.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Apenas administradores podem enviar campanhas." },
      { status: 403 },
    );
  }

  const rl = await rateLimit({
    prefix: "admin:campaign",
    max: 10,
    window: "10 m",
    key: session.sub,
  });
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: "Muitas operações em pouco tempo. Aguarde." },
      { status: 429 },
    );
  }

  const { slug } = await params;
  const summary = await sendCampaign(slug);

  const status = summary.ok ? 200 : summary.skipped === "not-found" ? 404 : 409;

  return NextResponse.json(summary, { status });
}
