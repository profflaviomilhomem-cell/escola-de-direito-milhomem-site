import Link from "next/link";

import type { MockForumThread } from "@/data/mock-aluno";

type Props = {
  thread: MockForumThread;
};

function ago(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days}d`;
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function ForumThreadCard({ thread }: Props) {
  return (
    <Link
      href={`/aluno/forum#${thread.slug}`}
      className="group border-paper-100 hover:border-amber bg-carbon-elevated relative flex w-[320px] flex-shrink-0 flex-col gap-3 border p-6 no-underline transition-colors md:w-[380px]"
    >
      <header className="flex items-center justify-between">
        <span className="text-paper-600 fm-mono">
          {thread.author.name} · {ago(thread.createdAt)}
        </span>
        {thread.professorReplied && (
          <span className="bg-amber text-carbon fm-mono px-2 py-1">
            Resposta do professor
          </span>
        )}
      </header>
      <h3 className="text-paper group-hover:text-amber line-clamp-2 font-serif text-lg leading-tight transition-colors">
        {thread.title}
      </h3>
      <p className="text-paper-700 line-clamp-3 text-sm leading-relaxed">
        {thread.body}
      </p>
      <p className="text-paper-600 fm-mono mt-auto">
        {thread.replyCount} resposta{thread.replyCount === 1 ? "" : "s"}
      </p>
    </Link>
  );
}
