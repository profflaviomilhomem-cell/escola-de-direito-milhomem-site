import { requireAdminSession } from "@/lib/auth/require-admin";
import type { Metadata } from "next";
import Link from "next/link";

import manifest from "@/data/provas-digitais-manifest.json";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Inventário — Prova Digital",
  robots: { index: false, follow: false },
};

function formatBytes(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  return `${Math.round(n / 1024)} KB`;
}

const LESSON_TOTAL = 10;

export default async function ProvaDigitalInventarioPage() {
  await requireAdminSession();
  const lessons = manifest.lessons.filter((l) => l.number <= LESSON_TOTAL);

  return (
    <section className="fm-site-page py-12">
      <header className="mb-8">
        <Link
          href="/professor/cursos"
          className="text-paper-600 hover:text-amber font-mono text-[10px] tracking-[0.2em] uppercase"
        >
          ← Cursos
        </Link>
        <h1
          className="fm-title-fluid mt-4 font-serif leading-[1.05]"
          style={fmTitleClamp("32px", "4vw", "48px")}
        >
          Inventário · <em className="text-amber italic">Prova Digital</em>
        </h1>
        <p className="text-paper-700 mt-3 max-w-3xl text-base leading-relaxed">
          Conferência técnica do acervo importado de{" "}
          <code className="text-paper">public/curso/milhomem</code> — atualizado
          em {new Date(manifest.importedAt).toLocaleString("pt-BR")}.{" "}
          {manifest.summary.videosOk}/{LESSON_TOTAL} vídeos editados ·{" "}
          {manifest.summary.slidesOk}/{LESSON_TOTAL} slides. Esta página é só
          para o professor; o aluno não vê nomes de arquivo de origem.
        </p>
      </header>

      <div className="border-paper-100 bg-carbon-elevated overflow-x-auto border">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="border-paper-100 border-b">
            <tr className="text-paper-600 font-mono text-[10px] tracking-[0.2em] uppercase">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Título na plataforma</th>
              <th className="px-4 py-3 text-left">Vídeo (arquivo editado)</th>
              <th className="px-4 py-3 text-left">Slides</th>
              <th className="px-4 py-3 text-right">Preview</th>
            </tr>
          </thead>
          <tbody className="divide-paper-100 divide-y">
            {lessons.map((l) => (
              <tr key={l.slug} className="hover:bg-paper-50 align-top">
                <td className="text-paper-600 px-4 py-4 font-mono">
                  {l.number.toString().padStart(2, "0")}
                </td>
                <td className="px-4 py-4">
                  <p className="text-paper font-serif leading-snug">
                    {l.title}
                  </p>
                </td>
                <td className="px-4 py-4">
                  {l.video ? (
                    <div className="space-y-1">
                      <p className="text-amber font-mono text-[10px] tracking-widest uppercase">
                        {l.video.variant === "editado"
                          ? "Editado"
                          : l.video.variant}
                      </p>
                      <p className="text-paper font-mono text-[11px] leading-relaxed break-all">
                        {l.video.sourceFile ?? "—"}
                      </p>
                      <p className="text-paper-600 font-mono text-[10px]">
                        {l.video.sourceArchive} · {formatBytes(l.video.bytes)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-alerta-400 font-mono text-[10px] uppercase">
                      Pendente
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {l.slides ? (
                    <div className="space-y-1">
                      <p className="text-paper font-mono text-[11px] leading-relaxed break-all">
                        {l.slides.sourceFile ?? "—"}
                      </p>
                      <p className="text-paper-600 font-mono text-[10px]">
                        {l.slides.sourceArchive} · {formatBytes(l.slides.bytes)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-alerta-400 font-mono text-[10px] uppercase">
                      Pendente
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/aluno/aulas/${l.slug}`}
                    className="text-amber font-mono text-[10px] uppercase hover:underline"
                  >
                    Ver aula
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-paper-600 mt-6 text-sm">
        Reimportar após novos ZIPs:{" "}
        <code className="text-paper">npm run import:provas-digitais</code>
      </p>
    </section>
  );
}
