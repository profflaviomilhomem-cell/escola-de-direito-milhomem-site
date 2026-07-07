import { NextResponse, type NextRequest } from "next/server";

import { verifyUnsubscribeToken } from "@/lib/auth/unsubscribe-token";
import { cancelSequence } from "@/lib/email/sequences";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/email/unsubscribe?token=… — descadastro (LGPD).
 *
 * Verifica o token assinado, marca TODAS as linhas de lead com aquele e-mail
 * como `unsubscribedAt`, cancela as sequências ativas e redireciona para uma
 * página de confirmação. A partir daí, motor e campanhas param de enviar.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(
      `${baseUrl}/newsletter/descadastro?status=invalid`,
    );
  }

  const payload = await verifyUnsubscribeToken(token);
  if (!payload?.email) {
    return NextResponse.redirect(
      `${baseUrl}/newsletter/descadastro?status=invalid`,
    );
  }

  try {
    await prisma.lead.updateMany({
      where: { email: payload.email },
      data: { unsubscribedAt: new Date() },
    });
    await cancelSequence(payload.email);
  } catch (err) {
    console.error("[api/email/unsubscribe] erro:", err);
    return NextResponse.redirect(
      `${baseUrl}/newsletter/descadastro?status=error`,
    );
  }

  return NextResponse.redirect(`${baseUrl}/newsletter/descadastro?status=ok`);
}
