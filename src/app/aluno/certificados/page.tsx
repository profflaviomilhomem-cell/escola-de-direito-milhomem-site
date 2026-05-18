import type { Metadata } from "next";

import { LabeledProgress } from "@/components/aluno/labeled-progress";
import { mockCertificates, mockCourse } from "@/data/mock-aluno";
import { progressPercentFromRatio } from "@/lib/utils";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Certificados — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

/**
 * Certificados emitidos + andamento do curso atual em direção ao próximo.
 * Critério de emissão: ≥ 90% das aulas concluídas (regra do checklist 4.4).
 */
export default function CertificadosPage() {
  const cursoProgress =
    mockCourse.completedLessonCount / mockCourse.lessonCount;
  const remainingLessons =
    mockCourse.lessonCount * 0.9 - mockCourse.completedLessonCount;

  return (
    <section className="fm-site-page py-20">
      <p className="text-amber fm-mono">Trajetória</p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("2.25rem", "4.5vw", "3.5rem")}
      >
        Certificados.
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
        Cada certificado vem com hash público de validação. Recrutadores e
        órgãos podem verificar autenticidade em{" "}
        <code className="text-amber font-mono">/certificado/[hash]</code>.
      </p>

      {/* Andamento — quanto falta para o próximo */}
      <div className="border-paper-100 bg-carbon-elevated mt-12 border p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[2fr_3fr] md:items-center">
          <div>
            <p className="text-amber fm-mono">A caminho</p>
            <h2 className="text-paper mt-2 font-serif text-2xl leading-tight">
              {mockCourse.title}
            </h2>
            <p className="text-paper-700 mt-2 text-sm">
              60h · Cohort 2026
            </p>
          </div>
          <div>
            <LabeledProgress
              label={`${Math.round(cursoProgress * 100)}%`}
              value={progressPercentFromRatio(cursoProgress)}
            />
            <p className="text-paper-700 mt-3 text-sm">
              Faltam{" "}
              <strong className="text-paper">
                {Math.max(0, Math.ceil(remainingLessons))} aulas
              </strong>{" "}
              para liberar a emissão (regra 90% do total).
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-paper mt-16 mb-6 font-serif text-2xl">
        Certificados emitidos
      </h2>

      {mockCertificates.length === 0 ? (
        <p className="text-paper-600 italic">
          Você ainda não tem certificados emitidos.
        </p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mockCertificates.map((cert) => (
            <li key={cert.id}>
              <article className="group border-paper-100 hover:border-amber bg-carbon-elevated overflow-hidden border transition-colors">
                <div
                  className="relative aspect-[4/3] overflow-hidden p-6"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${cert.cover.from}, ${cert.cover.to})`,
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-25 blur-2xl"
                    style={{ background: "var(--color-amber)" }}
                  />
                  <div className="border-amber/60 absolute inset-4 border" />
                  <div className="relative flex h-full flex-col">
                    <p className="text-amber fm-mono">Certificado · {cert.hoursLoad}h</p>
                    <p className="text-paper mt-3 font-serif text-xl leading-tight">
                      {cert.title}
                    </p>
                    <p className="text-paper-700 fm-mono mt-auto">
                      Emitido em{" "}
                      {new Date(cert.issuedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 p-4">
                  <code className="text-paper-700 truncate font-mono text-xs">
                    {cert.hash}
                  </code>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="border-paper-200 text-paper hover:border-amber fm-mono border px-3 py-1 transition-colors"
                    >
                      PDF
                    </button>
                    <a
                      href={`/certificado/${cert.hash}`}
                      className="border-amber text-amber hover:bg-amber hover:text-carbon fm-mono border px-3 py-1 transition-colors"
                    >
                      Validar
                    </a>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
