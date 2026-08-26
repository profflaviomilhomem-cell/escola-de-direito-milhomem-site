/**
 * Normalização do erro de cliente antes de ir para o log.
 *
 * A regra que estas funções existem para garantir: **nada que o usuário digitou
 * entra no log.** Um erro de aplicação acontece com frequência dentro de um
 * formulário — checkout, cadastro, recuperação de senha — e é exatamente ali
 * que a query string carrega token de recuperação, e-mail e UTM de campanha.
 * Registrar a URL inteira transformaria o log de erro num vazamento lento.
 *
 * Por isso: caminho sem query nem fragmento, stack cortada, tudo com teto de
 * tamanho. Mensagem e stack são de código nosso; o resto fica de fora.
 */

export const MAX_STACK_LINES = 12;

/**
 * Remove query string e fragmento de qualquer URL embutida no texto.
 *
 * A nota no topo prometia que "nada que o usuário digitou entra no log", mas a
 * limpeza só valia para o campo `path`. `message` e `stack` passavam inteiros —
 * e stack de cliente carrega URL de chunk e, quando um `fetch` falha, a URL
 * chamada. Se um dia um erro estourar dentro do fluxo de recuperação de senha,
 * é o token que iria junto. Agora a promessa vale para os três.
 */
function stripQuery(v: string): string {
  return v.replace(/(https?:\/\/[^\s"'<>]+?|\/[\w./-]+)[?#][^\s"'<>]*/g, "$1");
}

export function saneText(v: unknown, max = 500): string {
  if (typeof v !== "string") return "";
  return stripQuery(v).replace(/\s+/g, " ").trim().slice(0, max);
}

/** Stack inteira é ruído; as primeiras linhas é onde mora o quadro útil. */
export function trimStack(v: unknown): string {
  if (typeof v !== "string") return "";
  return stripQuery(v)
    .split("\n")
    .slice(0, MAX_STACK_LINES)
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" | ")
    .slice(0, 2_000);
}

/** Só o caminho. Query e fragmento são descartados sempre. */
export function pathOnly(v: unknown): string {
  const raw = saneText(v, 300);
  if (!raw.startsWith("/")) return "";
  return raw.split(/[?#]/)[0];
}

export type NormalizedClientError = {
  message: string;
  digest: string;
  path: string;
  stack: string;
};

export function normalizeClientError(body: unknown): NormalizedClientError {
  const b = (body ?? {}) as Record<string, unknown>;
  return {
    message: saneText(b.message) || "(sem mensagem)",
    digest: saneText(b.digest, 64),
    path: pathOnly(b.path),
    stack: trimStack(b.stack),
  };
}
