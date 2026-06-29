import { requireAdminSession } from "@/lib/auth/require-admin";
import type { Metadata } from "next";

import { ModerationQueue } from "@/components/professor/moderation-queue";
import { getModerationQueue } from "@/lib/forum/comments";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Fórum — Painel do professor",
  robots: { index: false, follow: false },
};

export default async function ProfessorForumPage() {
  await requireAdminSession();
  const items = await getModerationQueue();

  return (
    <section className="fm-site-page py-12">
      <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
        Moderação
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("36px", "4.5vw", "56px")}
      >
        Fórum <em className="text-amber italic">do cohort</em>
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl leading-relaxed">
        Comentários mais recentes de todas as aulas. Rejeitar oculta o
        comentário do fórum do aluno; aprovar o reexibe.
      </p>
      <div className="mt-10">
        <ModerationQueue items={items} />
      </div>
    </section>
  );
}
