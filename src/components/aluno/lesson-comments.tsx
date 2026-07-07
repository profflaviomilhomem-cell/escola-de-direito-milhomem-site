"use client";

import { useState } from "react";

import { CommentTree } from "@/components/aluno/comment-tree";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import type { ForumCommentNode } from "@/lib/forum/comments";

type Props = {
  productSlug: string;
  lessonSlug: string;
  initialComments: ForumCommentNode[];
};

/**
 * Fórum por aula — comentários aninhados persistidos (model Comment).
 * Recebe os comentários iniciais via SSR e recarrega após publicar/responder.
 */
export function LessonComments({
  productSlug,
  lessonSlug,
  initialComments,
}: Props) {
  const [comments, setComments] = useState<ForumCommentNode[]>(initialComments);
  const [error, setError] = useState<string | null>(null);
  const [root, setRoot] = useState("");
  const [posting, setPosting] = useState(false);

  async function refresh() {
    try {
      const res = await fetch(
        `/api/forum/comments?productSlug=${encodeURIComponent(
          productSlug,
        )}&lessonSlug=${encodeURIComponent(lessonSlug)}`,
      );
      const data = (await res.json()) as { comments?: ForumCommentNode[] };
      if (res.ok) setComments(data.comments ?? []);
    } catch {
      // mantém a árvore atual em caso de falha de rede
    }
  }

  async function publish(content: string, parentId: string | null) {
    if (!content.trim() || posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/forum/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, lessonSlug, content, parentId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar.");
        return;
      }
      track(ANALYTICS_EVENTS.FORUM_COMMENT_POSTED, {
        product_slug: productSlug,
        lesson_slug: lessonSlug,
        is_reply: parentId !== null,
      });
      if (parentId === null) setRoot("");
      await refresh();
    } catch {
      setError("Falha de rede ao enviar.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="border-alerta-400/50 text-alerta-400 bg-alerta-400/10 border px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void publish(root, null);
        }}
      >
        <label htmlFor="forum-root" className="text-amber fm-mono">
          Comentar nesta aula
        </label>
        <textarea
          id="forum-root"
          rows={3}
          value={root}
          onChange={(e) => setRoot(e.target.value)}
          placeholder="Escreva com clareza. Cite artigo/STJ quando puder."
          className="border-paper-200 focus:border-amber bg-carbon text-paper placeholder:text-paper-400 mt-3 block w-full border px-3 py-2 outline-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={posting || !root.trim()}
            className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono border px-4 py-2 transition-colors disabled:opacity-50"
          >
            {posting ? "Enviando…" : "Publicar comentário"}
          </button>
        </div>
      </form>

      <div className="border-paper-100 border-t pt-6">
        <CommentTree
          comments={comments}
          maxDepth={32}
          interactive
          onPublishReply={(parentId, body) => void publish(body, parentId)}
        />
      </div>
    </div>
  );
}
