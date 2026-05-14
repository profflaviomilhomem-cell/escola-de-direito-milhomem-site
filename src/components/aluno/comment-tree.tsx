"use client";

import Image from "next/image";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import type { MockComment } from "@/data/mock-aluno";

type Props = {
  comments: MockComment[];
  /** @deprecated use `maxDepth` — mantido por compatibilidade */
  depth?: number;
  /** Profundidade máxima de aninhamento visual (fórum pode usar 20+). */
  maxDepth?: number;
  /** Fórum: botão "Responder" em cada comentário + compositor. */
  interactive?: boolean;
  onPublishReply?: (parentId: string, body: string) => void;
};

const ROLE_LABEL: Record<MockComment["author"]["role"], string> = {
  professor: "Resposta do professor",
  monitor: "Monitor(a) da Escola",
  aluno: "Aluno(a)",
};

const ROLE_TONE: Record<
  MockComment["author"]["role"],
  { container: string; badge: string }
> = {
  professor: {
    container: "border-amber bg-amber/10 border-l-4 pl-4 py-3",
    badge: "bg-amber text-carbon",
  },
  monitor: {
    container: "border-paper-200 border-l-2 pl-4 py-3",
    badge: "bg-paper-200 text-paper",
  },
  aluno: {
    container: "border-paper-100 border-l border-l-2 pl-4 py-3",
    badge: "bg-carbon-elevated text-paper-700 border-paper-200 border",
  },
};

function ago(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function sortRepliesChronological(list: MockComment[]): MockComment[] {
  return [...list].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function CommentNode({
  comment,
  depth,
  maxDepth,
  interactive,
  onPublishReply,
  openReplyId,
  setOpenReplyId,
  draft,
  setDraft,
}: {
  comment: MockComment;
  depth: number;
  maxDepth: number;
  interactive?: boolean;
  onPublishReply?: (parentId: string, body: string) => void;
  openReplyId: string | null;
  setOpenReplyId: (id: string | null) => void;
  draft: string;
  setDraft: (s: string) => void;
}) {
  const repliesSorted = useMemo(
    () => sortRepliesChronological(comment.replies ?? []),
    [comment.replies],
  );

  const tone = ROLE_TONE[comment.author.role];
  const composerOpen = interactive && openReplyId === comment.id;

  function submitReply(e: FormEvent) {
    e.preventDefault();
    if (!onPublishReply || !draft.trim()) return;
    onPublishReply(comment.id, draft.trim());
    setDraft("");
    setOpenReplyId(null);
  }

  return (
    <article className={tone.container}>
      <header className="mb-2 flex flex-wrap items-center gap-3">
        {comment.author.role === "professor" ? (
          <Image
            src="/images/professor/flavio-avatar-64.jpg"
            alt={`Foto de ${comment.author.name}`}
            width={28}
            height={28}
            className="border-amber h-7 w-7 rounded-full border-2 object-cover"
          />
        ) : (
          <span
            className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${tone.badge}`}
          >
            {initials(comment.author.name)}
          </span>
        )}
        <span className="text-paper text-sm font-semibold">
          {comment.author.name}
        </span>
        {comment.author.role !== "aluno" && (
          <span className="bg-amber/15 text-amber border-amber/30 fm-mono border px-2 py-[2px]">
            {ROLE_LABEL[comment.author.role]}
          </span>
        )}
        <span className="text-paper-600 fm-mono">{ago(comment.createdAt)}</span>
      </header>
      <p className="text-paper-800 text-sm leading-relaxed md:text-base">
        {comment.content}
      </p>

      {interactive && onPublishReply && (
        <div className="mt-3">
          {!composerOpen ? (
            <button
              type="button"
              onClick={() => {
                setOpenReplyId(comment.id);
                setDraft("");
              }}
              className="text-amber hover:text-amber-soft fm-mono border border-transparent text-[10px] uppercase tracking-[0.16em] underline-offset-4 transition-colors hover:underline"
            >
              Responder a {comment.author.name.split(/\s+/)[0]}
            </button>
          ) : (
            <form
              onSubmit={submitReply}
              className="border-paper-100 bg-carbon/50 mt-2 border p-3"
            >
              <label className="sr-only" htmlFor={`reply-draft-${comment.id}`}>
                Texto da resposta
              </label>
              <textarea
                id={`reply-draft-${comment.id}`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="border-paper-200 focus:border-amber bg-carbon text-paper placeholder:text-paper-500 w-full border px-2 py-2 text-sm outline-none"
                placeholder="Resposta neste fio…"
                autoFocus
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em]"
                >
                  Publicar neste fio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenReplyId(null);
                    setDraft("");
                  }}
                  className="text-paper-600 hover:text-paper fm-mono text-[10px] uppercase tracking-[0.14em]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {repliesSorted.length > 0 && depth < maxDepth && (
        <div className="border-paper-100/80 mt-4 space-y-4 border-l pl-3 md:pl-4">
          {repliesSorted.map((r) => (
            <CommentNode
              key={r.id}
              comment={r}
              depth={depth + 1}
              maxDepth={maxDepth}
              interactive={interactive}
              onPublishReply={onPublishReply}
              openReplyId={openReplyId}
              setOpenReplyId={setOpenReplyId}
              draft={draft}
              setDraft={setDraft}
            />
          ))}
        </div>
      )}

      {repliesSorted.length > 0 && depth >= maxDepth && (
        <p className="text-amber fm-mono mt-3">
          + {repliesSorted.length} respostas →
        </p>
      )}
    </article>
  );
}

export function CommentTree({
  comments,
  depth = 3,
  maxDepth: maxDepthProp,
  interactive = false,
  onPublishReply,
}: Props) {
  const maxDepth = maxDepthProp ?? depth;
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const sortedRoots = useMemo(
    () => sortRepliesChronological(comments),
    [comments],
  );

  if (comments.length === 0) {
    return (
      <p className="text-paper-600 italic">
        Nenhuma resposta ainda. Seja o primeiro a comentar.
      </p>
    );
  }
  return (
    <div className="space-y-5">
      {sortedRoots.map((c) => (
        <CommentNode
          key={c.id}
          comment={c}
          depth={1}
          maxDepth={maxDepth}
          interactive={interactive}
          onPublishReply={onPublishReply}
          openReplyId={openReplyId}
          setOpenReplyId={setOpenReplyId}
          draft={draft}
          setDraft={setDraft}
        />
      ))}
    </div>
  );
}
