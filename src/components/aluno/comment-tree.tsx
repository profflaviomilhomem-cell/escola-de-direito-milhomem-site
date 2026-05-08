import type { MockComment } from "@/data/mock-aluno";

type Props = {
  comments: MockComment[];
  /** Profundidade máxima visual (CommentTree do Cap 8.7 — 3 níveis) */
  depth?: number;
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
    container:
      "border-amber bg-amber/10 border-l-4 pl-4 py-3",
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

function CommentNode({
  comment,
  depth,
  maxDepth,
}: {
  comment: MockComment;
  depth: number;
  maxDepth: number;
}) {
  const tone = ROLE_TONE[comment.author.role];
  return (
    <article className={tone.container}>
      <header className="mb-2 flex flex-wrap items-center gap-3">
        <span
          className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${tone.badge}`}
        >
          {initials(comment.author.name)}
        </span>
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

      {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((r) => (
            <CommentNode
              key={r.id}
              comment={r}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}

      {/* Em níveis profundos demais, oferece "ver mais respostas" como link
          de retomada futura (mantém UX acessível sem profundidade infinita) */}
      {comment.replies && comment.replies.length > 0 && depth >= maxDepth && (
        <p className="text-amber fm-mono mt-3">
          + {comment.replies.length} respostas →
        </p>
      )}
    </article>
  );
}

export function CommentTree({ comments, depth = 3 }: Props) {
  if (comments.length === 0) {
    return (
      <p className="text-paper-600 italic">
        Nenhuma resposta ainda. Seja o primeiro a comentar.
      </p>
    );
  }
  return (
    <div className="space-y-5">
      {comments.map((c) => (
        <CommentNode key={c.id} comment={c} depth={1} maxDepth={depth} />
      ))}
    </div>
  );
}
