import { NextResponse, type NextRequest } from "next/server";

import { normalizeClientError } from "@/lib/observability/client-error";

/**
 * Coletor de erro de cliente.
 *
 * Antes daqui, `error.tsx` tinha um `// TODO: encaminhar para Sentry` e um
 * `console.error` — que escreve no console **do visitante**. Ou seja: quando a
 * aplicação quebrava para um aluno, o único lugar onde isso aparecia era a
 * máquina dele. Ninguém do lado de cá ficava sabendo.
 *
 * Esta rota não substitui o Sentry; ela tira o projeto do zero. O erro passa a
 * chegar no log da função na Vercel, que é onde o resto dos erros do projeto
 * já vive. Quando houver DSN, o encaminhamento entra aqui — num lugar só, com
 * o formato já normalizado.
 *
 * O que **não** entra no log, de propósito: nada que o usuário digitou. Mensagem
 * de erro e stack de código nosso, mais rota e digest. Sem corpo de formulário,
 * sem query string, sem cookie.
 */

const MAX_BODY = 8_000;

export async function POST(req: NextRequest) {
  const raw = await req.text().catch(() => "");
  if (!raw || raw.length > MAX_BODY) {
    return new NextResponse(null, { status: 204 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const { message, digest, path, stack } = normalizeClientError(parsed);

  console.error(
    "[client-error] rota=%s digest=%s mensagem=%s stack=%s",
    path || "(desconhecida)",
    digest || "-",
    message,
    stack || "-",
  );

  // 204: a tela de erro não tem o que fazer com a resposta, e falhar aqui não
  // pode piorar uma situação que já é a de um erro.
  return new NextResponse(null, { status: 204 });
}
