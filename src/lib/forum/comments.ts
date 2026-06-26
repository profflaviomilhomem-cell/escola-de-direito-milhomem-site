import type { ModerationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { sanitizePlainText } from "@/lib/sanitize";

/** Nó de comentário no formato consumido pelo CommentTree (compatível com ForumComment). */
export type ForumCommentNode = {
  id: string;
  author: { name: string; role: "professor" | "aluno" };
  createdAt: string;
  content: string;
  replies: ForumCommentNode[];
};

type CommentRow = {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  user: { name: string | null; email: string; role: "ALUNO" | "ADMIN" };
};

function authorOf(user: CommentRow["user"]) {
  return {
    name: user.name ?? user.email.split("@")[0] ?? "Aluno",
    role: (user.role === "ADMIN" ? "professor" : "aluno") as
      | "professor"
      | "aluno",
  };
}

/** Monta a árvore (parentId) a partir da lista plana, em ordem cronológica. */
function buildTree(rows: CommentRow[]): ForumCommentNode[] {
  const nodes = new Map<string, ForumCommentNode>();
  for (const r of rows) {
    nodes.set(r.id, {
      id: r.id,
      author: authorOf(r.user),
      createdAt: r.createdAt.toISOString(),
      content: r.content,
      replies: [],
    });
  }
  const roots: ForumCommentNode[] = [];
  for (const r of rows) {
    const node = nodes.get(r.id)!;
    if (r.parentId && nodes.has(r.parentId)) {
      nodes.get(r.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

async function resolveLessonId(
  productSlug: string,
  lessonSlug: string,
): Promise<string | null> {
  const lesson = await prisma.lesson.findFirst({
    where: { slug: lessonSlug, product: { slug: productSlug } },
    select: { id: true },
  });
  return lesson?.id ?? null;
}

/**
 * Comentários visíveis de uma aula: aprovados + os do próprio usuário
 * (mesmo pendentes), em árvore cronológica.
 */
export async function listLessonComments(
  productSlug: string,
  lessonSlug: string,
  viewerId: string,
): Promise<ForumCommentNode[]> {
  const lessonId = await resolveLessonId(productSlug, lessonSlug);
  if (!lessonId) return [];

  const rows = await prisma.comment.findMany({
    where: {
      lessonId,
      OR: [{ moderationStatus: "APPROVED" }, { userId: viewerId }],
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      parentId: true,
      content: true,
      createdAt: true,
      user: { select: { name: true, email: true, role: true } },
    },
  });
  return buildTree(rows);
}

export async function createLessonComment(input: {
  userId: string;
  productSlug: string;
  lessonSlug: string;
  content: string;
  parentId?: string | null;
}): Promise<
  | { ok: true; comment: ForumCommentNode }
  | {
      ok: false;
      error: "LESSON_NOT_FOUND" | "PARENT_INVALID" | "CONTENT_EMPTY";
    }
> {
  const lessonId = await resolveLessonId(input.productSlug, input.lessonSlug);
  if (!lessonId) return { ok: false, error: "LESSON_NOT_FOUND" };

  // Defesa de profundidade: o conteúdo persiste já sanitizado (texto puro).
  const content = sanitizePlainText(input.content);
  if (content.length < 2) return { ok: false, error: "CONTENT_EMPTY" };

  if (input.parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: input.parentId, lessonId },
      select: { id: true },
    });
    if (!parent) return { ok: false, error: "PARENT_INVALID" };
  }

  const row = await prisma.comment.create({
    data: {
      lessonId,
      userId: input.userId,
      parentId: input.parentId ?? null,
      content,
      moderationStatus: "APPROVED",
    },
    select: {
      id: true,
      parentId: true,
      content: true,
      createdAt: true,
      user: { select: { name: true, email: true, role: true } },
    },
  });

  return {
    ok: true,
    comment: {
      id: row.id,
      author: authorOf(row.user),
      createdAt: row.createdAt.toISOString(),
      content: row.content,
      replies: [],
    },
  };
}

export type ModerationItem = {
  id: string;
  content: string;
  createdAt: string;
  status: ModerationStatus;
  author: { name: string; role: "professor" | "aluno" };
  lesson: { slug: string; title: string; productSlug: string };
};

function toModerationItem(row: {
  id: string;
  content: string;
  createdAt: Date;
  moderationStatus: ModerationStatus;
  user: CommentRow["user"];
  lesson: { slug: string; title: string; product: { slug: string } };
}): ModerationItem {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    status: row.moderationStatus,
    author: authorOf(row.user),
    lesson: {
      slug: row.lesson.slug,
      title: row.lesson.title,
      productSlug: row.lesson.product.slug,
    },
  };
}

/** Fila de moderação do professor: comentários mais recentes de todas as aulas. */
export async function getModerationQueue(
  limit = 60,
): Promise<ModerationItem[]> {
  try {
    const rows = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        content: true,
        createdAt: true,
        moderationStatus: true,
        user: { select: { name: true, email: true, role: true } },
        lesson: {
          select: {
            slug: true,
            title: true,
            product: { select: { slug: true } },
          },
        },
      },
    });
    return rows.map(toModerationItem);
  } catch {
    return [];
  }
}

export async function setCommentModeration(
  id: string,
  status: ModerationStatus,
): Promise<void> {
  await prisma.comment.update({
    where: { id },
    data: { moderationStatus: status },
  });
}

/** Feed recente do aluno: comentários aprovados nas aulas dos cursos informados. */
export async function listRecentCommentsForProducts(
  productSlugs: string[],
  limit = 40,
): Promise<ModerationItem[]> {
  if (productSlugs.length === 0) return [];
  try {
    const rows = await prisma.comment.findMany({
      where: {
        moderationStatus: "APPROVED",
        lesson: { product: { slug: { in: productSlugs } } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        content: true,
        createdAt: true,
        moderationStatus: true,
        user: { select: { name: true, email: true, role: true } },
        lesson: {
          select: {
            slug: true,
            title: true,
            product: { select: { slug: true } },
          },
        },
      },
    });
    return rows.map(toModerationItem);
  } catch {
    return [];
  }
}
