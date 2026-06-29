import {
  getPagarmeSecretKey,
  pagarmeApiUrl,
  pagarmeBasicAuth,
} from "@/lib/pagarme/config";
import type {
  PagarmeCreateOrderInput,
  PagarmeOrderResponse,
  PagarmeSubscriptionResponse,
} from "@/lib/pagarme/types";

export class PagarmeApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "PagarmeApiError";
    this.status = status;
    this.body = body;
  }
}

export async function pagarmeRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const secretKey = getPagarmeSecretKey();
  const res = await fetch(pagarmeApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: pagarmeBasicAuth(secretKey),
      ...(init.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : `Pagar.me HTTP ${res.status}`;
    throw new PagarmeApiError(message, res.status, body);
  }

  return body as T;
}

export async function createPagarmeOrder(
  input: PagarmeCreateOrderInput,
): Promise<PagarmeOrderResponse> {
  return pagarmeRequest<PagarmeOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createPagarmeSubscription(
  input: Record<string, unknown>,
): Promise<PagarmeSubscriptionResponse> {
  return pagarmeRequest<PagarmeSubscriptionResponse>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
