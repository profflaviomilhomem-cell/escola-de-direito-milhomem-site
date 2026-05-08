import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * Tokens curtos para duplo opt-in (newsletter / iscas).
 *
 * Ao contrário da sessão de aluno, esse token:
 *   - vive 48h (janela razoável para o usuário clicar);
 *   - usa issuer separado para não ser aceito como sessão;
 *   - carrega só o necessário para identificar o lead (e-mail + magnet).
 */

const ALGORITHM = "HS256";
const DEFAULT_TTL_SECONDS = 60 * 60 * 48; // 48h
const ISSUER = "escola-flavio-milhomem/confirm";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET ausente ou curto demais (mínimo 32 chars).",
    );
  }
  return new TextEncoder().encode(secret);
}

export type ConfirmPayload = {
  email: string;
  leadMagnetSlug?: string;
};

export async function signConfirmToken(
  payload: ConfirmPayload,
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

export async function verifyConfirmToken(
  token: string,
): Promise<ConfirmPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      algorithms: [ALGORITHM],
    });
    return {
      email: String(payload.email ?? ""),
      leadMagnetSlug: payload.leadMagnetSlug as string | undefined,
    };
  } catch {
    return null;
  }
}
