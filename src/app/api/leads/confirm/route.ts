import { NextResponse, type NextRequest } from "next/server";

import { sendMetaCapi } from "@/lib/analytics/meta-capi";
import { verifyConfirmToken } from "@/lib/auth/confirm-token";
import { enrollLead } from "@/lib/email/sequences";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leads/confirm?token=… — segunda etapa do duplo opt-in.
 *
 * Verifica o JWT (issuer dedicado), localiza o lead e marca
 * `doubleOptInAt`. Sempre redireciona o usuário para uma página
 * de feedback (confirmado ou link inválido), em vez de devolver
 * JSON cru — o destinatário do e-mail veio do Gmail/Outlook e
 * espera uma página visual.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(
      `${baseUrl}/newsletter/confirmado?status=invalid`,
    );
  }

  const payload = await verifyConfirmToken(token);
  if (!payload?.email) {
    return NextResponse.redirect(
      `${baseUrl}/newsletter/confirmado?status=invalid`,
    );
  }

  const leadMagnet = payload.leadMagnetSlug
    ? await prisma.leadMagnet
        .findUnique({ where: { slug: payload.leadMagnetSlug } })
        .catch(() => null)
    : null;

  try {
    const result = await prisma.lead.updateMany({
      where: {
        email: payload.email,
        leadMagnetId: leadMagnet?.id ?? null,
      },
      data: { doubleOptInAt: new Date() },
    });
    if (result.count === 0) {
      return NextResponse.redirect(
        `${baseUrl}/newsletter/confirmado?status=notfound`,
      );
    }
  } catch (err) {
    console.error("[api/leads/confirm] erro ao atualizar lead:", err);
    return NextResponse.redirect(
      `${baseUrl}/newsletter/confirmado?status=error`,
    );
  }

  // Sequência de boas-vindas (guia 6.13) — inscrita no opt-in confirmado.
  // Fire-and-forget e idempotente: reconfirmar o link não duplica a inscrição.
  void enrollLead("WELCOME", payload.email).catch((err) => {
    console.error("[api/leads/confirm] falha ao inscrever em WELCOME:", err);
  });

  // Lead confirmado (duplo opt-in) → Meta CAPI. event_id determinístico
  // (email + isca) deduplica reenvios do link; fire-and-forget.
  void sendMetaCapi("Lead", {
    eventId: `lead:${payload.email}:${payload.leadMagnetSlug ?? "newsletter"}`,
    email: payload.email,
    eventSourceUrl: `${baseUrl}/newsletter/confirmado`,
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.redirect(`${baseUrl}/newsletter/confirmado?status=ok`);
}
