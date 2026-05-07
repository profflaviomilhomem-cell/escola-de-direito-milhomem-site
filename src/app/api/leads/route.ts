import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

/**
 * POST /api/leads — captura de e-mail (newsletter, isca, calculadora).
 *
 * Validação Zod no servidor (cinto + suspensório, mesmo se o cliente
 * já validou). Duplo opt-in será disparado por Resend em sprint futura.
 */
const leadSchema = z.object({
  email: z.string().email("E-mail inválido").max(255),
  name: z.string().max(120).optional(),
  source: z.string().max(60).optional(),
  leadMagnetSlug: z.string().max(120).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    const contentType = req.headers.get("content-type") ?? "";
    payload = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload inválido" },
      { status: 400 },
    );
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { email, name, source, leadMagnetSlug, utmSource, utmMedium, utmCampaign } =
    parsed.data;

  const leadMagnet = leadMagnetSlug
    ? await prisma.leadMagnet
        .findUnique({ where: { slug: leadMagnetSlug } })
        .catch(() => null)
    : null;

  await prisma.lead
    .create({
      data: {
        email,
        name,
        source,
        leadMagnetId: leadMagnet?.id,
        optInAt: new Date(),
        utmSource,
        utmMedium,
        utmCampaign,
      },
    })
    .catch((err) => {
      // Se já existe (P2002), atualizamos optInAt em uma segunda chamada.
      if ((err as { code?: string }).code === "P2002") {
        return prisma.lead.updateMany({
          where: { email, leadMagnetId: leadMagnet?.id ?? null },
          data: { optInAt: new Date(), name: name ?? undefined },
        });
      }
      console.error("Falha ao gravar lead:", err);
      return null;
    });

  // TODO: disparar e-mail de confirmação (duplo opt-in) via Resend.
  return NextResponse.json({ ok: true }, { status: 201 });
}
