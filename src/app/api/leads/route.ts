import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { signConfirmToken } from "@/lib/auth/confirm-token";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend/client";
import { renderConfirmNewsletterEmail } from "@/lib/resend/templates/confirm-newsletter";
import { rateLimit } from "@/lib/upstash/rate-limit";
import { newsletterSchema } from "@/schemas/newsletter";

/**
 * POST /api/leads — captura de e-mail (newsletter, isca, calculadora).
 *
 * Pipeline:
 *   1. Rate limit por IP (Upstash, no-op em dev).
 *   2. Validação Zod no servidor (cinto + suspensório).
 *   3. Honeypot — descarta bots em silêncio.
 *   4. Persistência idempotente (`@@unique([email, leadMagnetId])`).
 *   5. Disparo do duplo opt-in via Resend (no-op se sem API key).
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = await rateLimit({
    prefix: "leads:newsletter",
    max: 5,
    window: "10 m",
    key: ip,
  });
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    const contentType = req.headers.get("content-type") ?? "";
    raw = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload inválido" },
      { status: 400 },
    );
  }

  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const trimmedName = data.name?.trim();
  const name =
    trimmedName && trimmedName.length > 0 ? trimmedName : undefined;

  // Honeypot — fingimos sucesso para não ensinar o bot.
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const leadMagnet = data.leadMagnetSlug
    ? await prisma.leadMagnet
        .findUnique({ where: { slug: data.leadMagnetSlug } })
        .catch(() => null)
    : null;

  // Insert idempotente: tenta `create` e, em colisão (P2002 — mesmo
  // email/leadMagnet), refresca o `optInAt` via `updateMany`. Evita o
  // edge case do `upsert` com chave composta nullable que ainda não
  // tipa bem no Prisma client gerado.
  try {
    await prisma.lead.create({
      data: {
        email: data.email,
        name: name,
        source: data.source ?? "newsletter",
        leadMagnetId: leadMagnet?.id,
        optInAt: new Date(),
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
      },
    });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      await prisma.lead.updateMany({
        where: { email: data.email, leadMagnetId: leadMagnet?.id ?? null },
        data: {
          optInAt: new Date(),
          name: name ?? undefined,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
        },
      });
    } else {
      console.error("[api/leads] Falha ao gravar lead:", err);
      return NextResponse.json(
        { ok: false, error: "Falha ao registrar inscrição. Tente novamente." },
        { status: 500 },
      );
    }
  }

  // Duplo opt-in — disparado em paralelo, sem bloquear a resposta da API.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const token = await signConfirmToken({
    email: data.email,
    leadMagnetSlug: data.leadMagnetSlug,
  });
  const confirmUrl = `${baseUrl}/api/leads/confirm?token=${encodeURIComponent(token)}`;

  const email = renderConfirmNewsletterEmail({
    confirmUrl,
    name: name,
  });

  // Não dependemos do envio para retornar 201 — falha de e-mail vira log.
  void sendEmail({
    to: data.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  }).then((result) => {
    if (!result.ok) {
      console.error("[api/leads] Falha ao enviar e-mail:", result.error);
    }
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
