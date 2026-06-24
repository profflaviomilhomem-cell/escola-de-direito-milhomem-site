import { createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";

export type UtmEventInput = {
  userId?: string | null;
  destination: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  shortCode?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

/** Hash do IP com salt do AUTH_SECRET — LGPD: nunca guardamos IP em claro. */
function hashIp(ip?: string | null): string | null {
  if (!ip || ip === "unknown") return null;
  const salt = process.env.AUTH_SECRET ?? "fm-utm";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Persiste um evento de conversão na tabela UTMEvent (funil por campanha).
 * Best-effort: nunca lança nem bloqueia o fluxo que o chamou.
 */
export async function recordUtmEvent(input: UtmEventInput): Promise<void> {
  const hasSignal =
    input.utmSource ||
    input.utmMedium ||
    input.utmCampaign ||
    input.shortCode ||
    input.userId;
  if (!hasSignal) return; // sem UTM/usuário não há funil a registrar

  try {
    await prisma.uTMEvent.create({
      data: {
        userId: input.userId ?? null,
        destination: input.destination,
        shortCode: input.shortCode ?? null,
        utmSource: input.utmSource ?? null,
        utmMedium: input.utmMedium ?? null,
        utmCampaign: input.utmCampaign ?? null,
        utmContent: input.utmContent ?? null,
        utmTerm: input.utmTerm ?? null,
        ipHash: hashIp(input.ip),
        userAgent: input.userAgent ?? null,
      },
    });
  } catch {
    // Silencioso: telemetria nunca derruba conversão.
  }
}
