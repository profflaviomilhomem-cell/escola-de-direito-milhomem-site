import bcrypt from "bcryptjs";

/**
 * Hash e verificação de senha — bcryptjs 3.x.
 *
 * ALERTA — bcrypt trunca silenciosamente senhas com mais de 72 BYTES.
 * Sempre validar o comprimento máximo via Zod no formulário e no servidor:
 *   z.string().min(8).max(72)
 *
 * Vide Seção 3.11 do Guia de Desenvolvimento Web.
 */

const MAX_PASSWORD_BYTES = 72;
const COST_FACTOR = 12;

export class PasswordTooLongError extends Error {
  constructor() {
    super(
      `Senha excede o limite de ${MAX_PASSWORD_BYTES} bytes do bcrypt.`,
    );
    this.name = "PasswordTooLongError";
  }
}

function assertPasswordLength(plaintext: string): void {
  const byteLength = new TextEncoder().encode(plaintext).length;
  if (byteLength > MAX_PASSWORD_BYTES) {
    throw new PasswordTooLongError();
  }
}

export async function hashPassword(plaintext: string): Promise<string> {
  assertPasswordLength(plaintext);
  return bcrypt.hash(plaintext, COST_FACTOR);
}

export async function verifyPassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  // Não chamamos assertPasswordLength aqui — verify de senha truncada
  // retorna false naturalmente.
  return bcrypt.compare(plaintext, hash);
}
