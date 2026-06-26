import { NextResponse, type NextRequest } from "next/server";

import { verifyConfirmToken } from "@/lib/auth/confirm-token";
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

  return NextResponse.redirect(`${baseUrl}/newsletter/confirmado?status=ok`);
}
