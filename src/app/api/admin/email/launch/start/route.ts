import { NextResponse } from "next/server";

import { getSessionFromCookies } from "@/lib/auth/session";
import { enrollLead } from "@/lib/email/sequences";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/upstash/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/email/launch/start — dispara a sequência de LANÇAMENTO.
 *
 * Gatilho MANUAL do open cart (guia 6.13): inscreve na sequência LAUNCH todos
 * os leads elegíveis (duplo opt-in, não descadastrados). Idempotente — leads
 * já ativos na sequência são pulados. GATED por sessão admin (padrão do
 * /api/admin/refunds).
 */
export async function POST() {
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
      {
        ok: false,
        error: "Apenas administradores podem iniciar o lançamento.",
      },
      { status: 403 },
    );
  }

  const rl = await rateLimit({
    prefix: "admin:launch",
    max: 5,
    window: "10 m",
    key: session.sub,
  });
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: "Muitas operações em pouco tempo. Aguarde." },
      { status: 429 },
    );
  }

  const leads = await prisma.lead.findMany({
    where: { doubleOptInAt: { not: null }, unsubscribedAt: null },
    select: { email: true },
  });
  const emails = [...new Set(leads.map((l) => l.email))];

  let enrolled = 0;
  let skipped = 0;
  for (const email of emails) {
    const result = await enrollLead("LAUNCH", email);
    if (result.enrolled) enrolled += 1;
    else skipped += 1;
  }

  return NextResponse.json({
    ok: true,
    total: emails.length,
    enrolled,
    skipped,
  });
}
