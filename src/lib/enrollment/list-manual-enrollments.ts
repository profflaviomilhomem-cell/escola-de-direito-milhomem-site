import {
  ORDER_STATUSES_WITH_ACCESS,
  SUBSCRIPTION_STATUS_WITH_ACCESS,
} from "@/lib/business/commercial-rules";
import { isManualPagarmeSubId } from "@/lib/enrollment/manual-access-payload";
import { prisma } from "@/lib/prisma";

export type ManualEnrollmentRow =
  | {
      kind: "order";
      id: string;
      createdAt: string;
      studentEmail: string;
      studentName: string | null;
      productSlug: string;
      productName: string;
      note?: string;
    }
  | {
      kind: "subscription";
      id: string;
      createdAt: string;
      studentEmail: string;
      studentName: string | null;
      productSlug: string;
      productName: string;
    };

export async function listManualEnrollments(
  limit = 40,
): Promise<ManualEnrollmentRow[]> {
  const [orders, subscriptions] = await Promise.all([
    prisma.order.findMany({
      where: {
        paymentMethod: "MANUAL",
        status: { in: [...ORDER_STATUSES_WITH_ACCESS] },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        user: { select: { email: true, name: true } },
        product: { select: { slug: true, name: true } },
      },
    }),
    prisma.subscription.findMany({
      where: {
        status: SUBSCRIPTION_STATUS_WITH_ACCESS,
        pagarmeSubId: { startsWith: "manual_" },
      },
      orderBy: { startedAt: "desc" },
      take: limit,
      include: {
        user: { select: { email: true, name: true } },
        product: { select: { slug: true, name: true } },
      },
    }),
  ]);

  const rows: ManualEnrollmentRow[] = [];

  for (const o of orders) {
    const payload = o.paymentPayload as { note?: string } | null;
    rows.push({
      kind: "order",
      id: o.id,
      createdAt: o.updatedAt.toISOString(),
      studentEmail: o.user.email,
      studentName: o.user.name,
      productSlug: o.product.slug,
      productName: o.product.name,
      note: payload?.note,
    });
  }

  for (const s of subscriptions) {
    if (!isManualPagarmeSubId(s.pagarmeSubId)) continue;
    rows.push({
      kind: "subscription",
      id: s.id,
      createdAt: s.startedAt.toISOString(),
      studentEmail: s.user.email,
      studentName: s.user.name,
      productSlug: s.product.slug,
      productName: s.product.name,
    });
  }

  rows.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return rows.slice(0, limit);
}
