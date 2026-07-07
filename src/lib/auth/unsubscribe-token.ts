import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * Token de descadastro (LGPD) embutido no rodapé de todo e-mail.
 *
 * Mesmo padrão do confirm-token, com issuer próprio para não ser aceito
 * como sessão nem como confirmação. TTL longo (1 ano): o link de
 * descadastro precisa continuar válido enquanto o e-mail estiver na
 * caixa de entrada do destinatário.
 */

const ALGORITHM = "HS256";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 ano
const ISSUER = "escola-flavio-milhomem/unsubscribe";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET ausente ou curto demais (mínimo 32 chars).");
  }
  return new TextEncoder().encode(secret);
}

export type UnsubscribePayload = {
  email: string;
};

export async function signUnsubscribeToken(
  payload: UnsubscribePayload,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: ALGORITHM, typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .setIssuer(ISSUER)
    .sign(getSecretKey());
}

export async function verifyUnsubscribeToken(
  token: string,
): Promise<UnsubscribePayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      algorithms: [ALGORITHM],
    });
    const email = String(payload.email ?? "");
    if (!email) return null;
    return { email };
  } catch {
    return null;
  }
}
