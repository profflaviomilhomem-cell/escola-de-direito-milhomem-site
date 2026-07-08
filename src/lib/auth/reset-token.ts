import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * Tokens de curta duração para recuperação de senha.
 *
 * - TTL: 1 hora (janela de segurança estreita).
 * - Issuer: 'escola-flavio-milhomem/reset'.
 */

const ALGORITHM = "HS256";
const RESET_TTL_SECONDS = 60 * 60; // 1 hora
const ISSUER = "escola-flavio-milhomem/reset";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET ausente ou curto demais (mínimo 32 chars).");
  }
  return new TextEncoder().encode(secret);
}

export type ResetPayload = {
  sub: string; // user id
  email: string;
  /**
   * Fingerprint do hash de senha no momento da emissão (ver
   * `passwordFingerprint`). Torna o token single-use: assim que a senha é
   * trocada, o fingerprint muda e o token antigo deixa de ser aceito no reset.
   */
  pv: string;
};

export async function signResetToken(payload: ResetPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: ALGORITHM, typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + RESET_TTL_SECONDS)
    .setIssuer(ISSUER)
    .sign(getSecretKey());
}

export async function verifyResetToken(
  token: string,
): Promise<ResetPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      algorithms: [ALGORITHM],
    });
    return {
      sub: String(payload.sub ?? ""),
      email: String(payload.email ?? ""),
      pv: String(payload.pv ?? ""),
    };
  } catch {
    return null;
  }
}
