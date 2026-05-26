import type { SubscriptionStatus } from "@prisma/client";

import {
  extractPagarmeSubscriptionId,
  parsePagarmeDate,
  readPagarmeMetadata,
} from "@/lib/pagarme/map-subscription";
import { prisma } from "@/lib/prisma";

export type SubscriptionSyncResult =
  | { ok: true; id: string; created: boolean }
  | { ok: false; reason: "missing_id" | "missing_parties" | "skipped" };

async function resolveUserAndProduct(data: Record<string, unknown>) {
  const metadata = readPagarmeMetadata(data);
  let userId: string | null = metadata.userId ?? null;
  let productId: string | null = metadata.productId ?? null;

  const code = typeof data.code === "string" ? data.code.trim() : null;

  if (!userId && code) {
    const byCode = await prisma.subscription.findUnique({
      where: { id: code },
      select: { userId: true, productId: true },
    });
    if (byCode) {
      userId = byCode.userId;
      productId = byCode.productId;
    }
  }

  if (!userId) {
    const customer = data.customer as Record<string, unknown> | undefined;
    const email =
      typeof customer?.email === "string"
        ? customer.email.trim().toLowerCase()
        : null;
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      userId = user?.id ?? null;
    }
  }

  if (!productId) {
    const slug =
      metadata.productSlug ??
      (() => {
        const items = Array.isArray(data.items) ? data.items : [];
        const first = items[0] as Record<string, unknown> | undefined;
        return typeof first?.code === "string" ? first.code.trim() : null;
      })();

    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      });
      productId = product?.id ?? null;
    }
  }

  return { userId, productId };
}

export async function upsertSubscriptionFromWebhook(input: {
  data: Record<string, unknown>;
  status: SubscriptionStatus;
  pagarmeSubId?: string | null;
}): Promise<SubscriptionSyncResult> {
  const pagarmeSubId =
    input.pagarmeSubId ?? extractPagarmeSubscriptionId(input.data);

  if (!pagarmeSubId) {
    return { ok: false, reason: "missing_id" };
  }

  let { userId, productId } = await resolveUserAndProduct(input.data);

  if (!userId || !productId) {
    const linked = await prisma.subscription.findFirst({
      where: { pagarmeSubId },
      select: { id: true, userId: true, productId: true },
    });
    if (linked) {
      userId = linked.userId;
      productId = linked.productId;
    }
  }

  if (!userId || !productId) {
    console.warn(
      `[pagarme webhook] subscription ${pagarmeSubId} sem user/product resolvíveis`,
    );
    return { ok: false, reason: "missing_parties" };
  }

  const nextBillingAt = parsePagarmeDate(input.data.next_billing_at);
  const canceledAt =
    input.status === "CANCELED" ? new Date() : null;

  const existing = await prisma.subscription.findFirst({
    where: {
      OR: [{ pagarmeSubId }, { userId, productId, pagarmeSubId: null }],
    },
    orderBy: { startedAt: "desc" },
  });

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        pagarmeSubId,
        status: input.status,
        nextBillingAt,
        canceledAt:
          input.status === "CANCELED"
            ? (existing.canceledAt ?? canceledAt)
            : null,
      },
    });
    return { ok: true, id: existing.id, created: false };
  }

  const created = await prisma.subscription.create({
    data: {
      userId,
      productId,
      pagarmeSubId,
      status: input.status,
      nextBillingAt,
      canceledAt,
    },
  });

  return { ok: true, id: created.id, created: true };
}

/** Ativa assinatura quando uma cobrança vinculada é paga. */
export async function activateSubscriptionFromCharge(
  data: Record<string, unknown>,
): Promise<SubscriptionSyncResult> {
  const pagarmeSubId = extractPagarmeSubscriptionId(data);
  if (!pagarmeSubId) {
    return { ok: false, reason: "missing_id" };
  }

  return upsertSubscriptionFromWebhook({
    data,
    pagarmeSubId,
    status: "ACTIVE",
  });
}

export async function getSubscriptionForUser(
  subscriptionId: string,
  userId: string,
) {
  return prisma.subscription.findFirst({
    where: { id: subscriptionId, userId },
    include: {
      product: { select: { slug: true, name: true, priceCents: true } },
    },
  });
}
