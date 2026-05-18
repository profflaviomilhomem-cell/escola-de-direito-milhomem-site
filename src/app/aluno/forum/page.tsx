import type { Metadata } from "next";

import { ForumFeed } from "@/components/aluno/forum-feed";
import { mockCourse, mockForumThreads } from "@/data/mock-aluno";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Fórum — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

/**
 * Fórum — feed compacto com toolbar (busca, filtros, ordenação) sticky
 * abaixo do top nav. Cada thread expande inline (`<details>` nativo).
 * Resposta do professor recebe destaque editorial — selo, borda amber,
 * tone amber/10 no container.
 *
 * Estado de filtro/busca vive no client component `<ForumFeed>`. A
 * página em si só fornece os dados (mock por enquanto) e o header
 * editorial.
 */
export default function ForumPage() {
  return (
    <>
      {/* Header editorial — só na primeira dobra; toolbar mora em ForumFeed */}
      <section className="fm-site-page pb-6 pt-12 lg:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-amber fm-mono">Comunidade</p>
            <h1
              className="fm-title-fluid mt-3 font-serif leading-[1.05]"
              style={fmTitleClamp("2.25rem", "4.5vw", "3.5rem")}
            >
              Fórum da Escola.
            </h1>
            <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed">
              Onde casos reais viram aprendizado coletivo. Flávio responde em
              até 72h; monitores filtram nulidades e padronizações antes.
            </p>
          </div>

          <dl className="border-paper-100 bg-carbon-elevated grid w-full max-w-md grid-cols-3 gap-px border md:w-auto md:max-w-none">
            <Stat
              label="Tópicos"
              value={mockForumThreads.length.toString()}
            />
            <Stat
              label="Sem prof."
              value={mockForumThreads
                .filter((t) => !t.professorReplied)
                .length.toString()}
              tone="danger"
            />
            <Stat label="SLA" value="≤ 72h" />
          </dl>
        </div>
      </section>

      {/* Toolbar + feed (client) */}
      <ForumFeed threads={mockForumThreads} course={mockCourse} />
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger";
}) {
  return (
    <div className="bg-carbon-elevated px-4 py-3">
      <dt className="text-paper-600 fm-mono">{label}</dt>
      <dd
        className={`mt-1 font-serif text-xl ${tone === "danger" ? "text-alerta-400" : "text-paper"}`}
      >
        {value}
      </dd>
    </div>
  );
}
