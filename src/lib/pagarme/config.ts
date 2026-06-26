const PAGARME_API_BASE = "https://api.pagar.me/core/v5";

export function isPagarmeConfigured(): boolean {
  return Boolean(process.env.PAGARME_SECRET_KEY?.trim());
}

export function getPagarmeSecretKey(): string {
  const key = process.env.PAGARME_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      "PAGARME_SECRET_KEY ausente — configure em .env.local ou Vercel.",
    );
  }
  return key;
}

export function pagarmeApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${PAGARME_API_BASE}${normalized}`;
}

export function pagarmeBasicAuth(secretKey: string): string {
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}
