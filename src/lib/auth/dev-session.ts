import type { SessionPayload } from "@/lib/auth/jwt";

/** Cookie dev-only: permite aluno e professor em abas diferentes. */
export const DEV_ROLE_COOKIE = "fm_dev_role";

const ALUNO_FAKE_SESSION: SessionPayload = {
  sub: "user_rafael_mock",
  email: "rafael@advogados-rj.com",
  name: "Rafael Andrade",
  role: "aluno",
};

const PROFESSOR_FAKE_SESSION: SessionPayload = {
  sub: "user_flavio_mock",
  email: "flavio@escolaflaviomilhomem.com.br",
  name: "Flávio Milhomem",
  role: "admin",
};

export function resolveDevFakeSession(
  roleHint?: string | null,
): SessionPayload | null {
  if (process.env.NODE_ENV === "production") return null;

  const flag = (roleHint ?? process.env.NEXT_PUBLIC_DEV_FAKE_SESSION ?? "")
    .trim()
    .toLowerCase();

  if (flag === "professor" || flag === "admin") return PROFESSOR_FAKE_SESSION;
  if (flag === "aluno" || flag === "1") return ALUNO_FAKE_SESSION;
  return null;
}

export function isDevFakeSessionEnabled(roleHint?: string | null): boolean {
  return resolveDevFakeSession(roleHint) !== null;
}
