import { randomUUID } from "node:crypto";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server-track";
import { prisma } from "@/lib/prisma";

export type CertificateView = {
  hash: string;
  issuedAt: string;
  productName: string;
  productSlug: string;
  userName: string;
};

function publicHash(): string {
  return randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase();
}

/**
 * Emite o certificado se o aluno concluiu 100% das aulas do produto e ainda
 * não tem certificado. Idempotente (unique userId+productId). Best-effort:
 * retorna o hash existente/novo, ou null se inelegível/banco indisponível.
 */
export async function issueCertificateIfEligible(
  userId: string,
  productSlug: string,
): Promise<string | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });
    if (!product) return null;

    const existing = await prisma.certificate.findUnique({
      where: { userId_productId: { userId, productId: product.id } },
      select: { hash: true },
    });
    if (existing) return existing.hash;

    const [total, completed] = await Promise.all([
      prisma.lesson.count({ where: { productId: product.id } }),
      prisma.userLessonProgress.count({
        where: {
          userId,
          completedAt: { not: null },
          lesson: { productId: product.id },
        },
      }),
    ]);
    if (total === 0 || completed < total) return null;

    // Nome completo é requisito de emissão (04/08/2026). O cadastro aceita conta
    // sem nome (`registerSchema` deixa o campo opcional) e o certificado caía no
    // prefixo do e-mail — documento oficial nomeando o aluno de "joaosilva88".
    // Preferimos não emitir a emitir errado: o aluno completa o perfil e o
    // certificado sai na visita seguinte (esta função é idempotente e roda de
    // novo ao abrir /aluno/certificados).
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    if (!user?.name?.trim()) return null;

    const cert = await prisma.certificate.create({
      data: { userId, productId: product.id, hash: publicHash() },
      select: { hash: true },
    });

    // certificate_issued (guia 8.5) — server-side, fire-and-forget.
    void trackServerEvent(ANALYTICS_EVENTS.CERTIFICATE_ISSUED, {
      userId,
      product_slug: productSlug,
      certificate_hash: cert.hash,
    });

    return cert.hash;
  } catch {
    return null;
  }
}

export async function getUserCertificates(
  userId: string,
): Promise<CertificateView[]> {
  try {
    const rows = await prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    });
    return rows.map((r) => ({
      hash: r.hash,
      issuedAt: r.issuedAt.toISOString(),
      productName: r.product.name,
      productSlug: r.product.slug,
      // Sem fallback para prefixo de e-mail: a emissão já exige nome (acima).
      userName: r.user.name?.trim() || "Aluno",
    }));
  } catch {
    return [];
  }
}

export async function getCertificateByHash(
  hash: string,
): Promise<CertificateView | null> {
  try {
    const r = await prisma.certificate.findUnique({
      where: { hash },
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    });
    if (!r) return null;
    return {
      hash: r.hash,
      issuedAt: r.issuedAt.toISOString(),
      productName: r.product.name,
      productSlug: r.product.slug,
      // Sem fallback para prefixo de e-mail: a emissão já exige nome (acima).
      userName: r.user.name?.trim() || "Aluno",
    };
  } catch {
    return null;
  }
}
