import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  verifyPassword,
  hashPassword,
  PasswordTooLongError,
} from "@/lib/auth/password";
import { getSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { updatePasswordSchema } from "@/schemas/auth";

/**
 * PATCH /api/auth/update-password — troca senha logado.
 *
 * Pipeline:
 *   1. Verifica sessão.
 *   2. Validação Zod.
 *   3. Busca usuário e verifica currentPassword via bcrypt.
 *   4. bcrypt(12) da newPassword.
 *   5. Update no banco.
 */
export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Não autorizado." },
      { status: 401 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload inválido." },
      { status: 400 },
    );
  }

  const parsed = updatePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { ok: false, error: "Usuário não encontrado." },
      { status: 404 },
    );
  }

  // Valida senha atual
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Senha atual incorreta." },
      { status: 401 },
    );
  }

  // Hash da nova senha
  let newHash: string;
  try {
    newHash = await hashPassword(newPassword);
  } catch (err) {
    if (err instanceof PasswordTooLongError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: 422 },
      );
    }
    throw err;
  }

  await prisma.user.update({
    where: { id: session.sub },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({ ok: true });
}
