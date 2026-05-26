/** Metadados gravados em `Order.paymentPayload` para matrículas manuais. */
export type ManualAccessOrderPayload = {
  source: "manual_grant";
  grantedByUserId: string;
  grantedAt: string;
  note?: string;
};

export function buildManualAccessPayload(
  grantedByUserId: string,
  note?: string,
): ManualAccessOrderPayload {
  return {
    source: "manual_grant",
    grantedByUserId,
    grantedAt: new Date().toISOString(),
    ...(note?.trim() ? { note: note.trim() } : {}),
  };
}

export function isManualPagarmeSubId(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith("manual_");
}
