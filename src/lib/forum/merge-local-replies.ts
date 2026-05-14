import type { MockComment } from "@/data/mock-aluno";

/** Parent sintético — resposta de topo (irmãs do primeiro nível do mock). */
export const FORUM_ROOT_PARENT_ID = "__forum_root__";

function sortByCreatedAtChronological(list: MockComment[]): MockComment[] {
  return [...list].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

/**
 * Anexa uma resposta ao nó `parentId` (DFS). Imutável.
 * Devolve `null` se o pai não existir nesta lista nem nos filhos.
 */
function attachToParent(
  nodes: MockComment[],
  parentId: string,
  reply: MockComment,
): MockComment[] | null {
  const topIdx = nodes.findIndex((n) => n.id === parentId);
  if (topIdx >= 0) {
    const next = [...nodes];
    const n = next[topIdx];
    next[topIdx] = {
      ...n,
      replies: sortByCreatedAtChronological([...(n.replies ?? []), reply]),
    };
    return next;
  }

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!n.replies?.length) continue;
    const inner = attachToParent(n.replies, parentId, reply);
    if (inner) {
      const next = [...nodes];
      next[i] = { ...n, replies: inner };
      return next;
    }
  }
  return null;
}

/**
 * Junta respostas criadas em memória (ex.: antes da API) à árvore do mock.
 * `parentId === FORUM_ROOT_PARENT_ID` → novo comentário de primeiro nível.
 */
function sortTreeClone(nodes: MockComment[]): MockComment[] {
  return sortByCreatedAtChronological(nodes).map((n) => ({
    ...n,
    replies: n.replies?.length ? sortTreeClone(n.replies) : undefined,
  }));
}

export function mergeLocalRepliesIntoComments(
  base: MockComment[],
  locals: ReadonlyArray<{ parentId: string; comment: MockComment }>,
): MockComment[] {
  let out = sortTreeClone(base);

  for (const { parentId, comment } of locals) {
    if (parentId === FORUM_ROOT_PARENT_ID) {
      out = sortByCreatedAtChronological([...out, comment]);
    } else {
      const attached = attachToParent(out, parentId, comment);
      if (attached) out = attached;
    }
  }
  return out;
}

export function newLocalForumComment(
  body: string,
  authorName: string,
): MockComment {
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    author: { name: authorName, role: "aluno" },
    createdAt: new Date().toISOString(),
    content: body.trim(),
  };
}
