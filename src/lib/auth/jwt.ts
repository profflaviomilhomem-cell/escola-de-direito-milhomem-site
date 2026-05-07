import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * JWT helpers — jose 6.x.
 *
 * Sessão da Escola usa HS256 com secret simétrico (não há cliente público
 * lendo o token, então EdDSA com chave assimétrica é overkill).
 *
 * O secret vem de `AUTH_SECRET` (mínimo 256 bits). Em produção,
 * gerar com `openssl rand -base64 48`.
 */

const ALGORITHM = "HS256";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET ausente ou curto demais (mínimo 32 chars). Gere com: openssl rand -base64 48",
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string; // user id (cuid)
  email: string;
  name?: string;
  role?: "aluno" | "admin";
};

export async function signSession(
  payload: SessionPayload,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: ALGORITHM, typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .setIssuer("escola-flavio-milhomem")
    .sign(getSecretKey());
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: "escola-flavio-milhomem",
      algorithms: [ALGORITHM],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
