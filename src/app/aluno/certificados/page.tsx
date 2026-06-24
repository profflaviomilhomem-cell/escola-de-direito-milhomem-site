import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { getSessionFromCookies } from "@/lib/auth/session";
import {
  getUserCertificates,
  issueCertificateIfEligible,
} from "@/lib/certificates";
import { getEnrolledCoursesWithProgress } from "@/lib/enrollment";

export const metadata: Metadata = {
  title: "Certificados",
  robots: { index: false, follow: false },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function CertificadosPage() {
  const session = await getSessionFromCookies();
  const userId = session?.sub;
  if (!userId) redirect("/entrar");

  const enrolled = await getEnrolledCoursesWithProgress(userId);

  // Materializa certificados de quem já concluiu (idempotente, best-effort).
  await Promise.all(
    enrolled.map((c) => issueCertificateIfEligible(userId, c.slug)),
  );
  const certificates = await getUserCertificates(userId);

  if (enrolled.length === 0) {
    return (
      <section className="fm-site-page py-20">
        <p className="text-amber fm-mono">Credenciais</p>
        <h1 className="text-paper mt-3 font-serif text-3xl md:text-4xl">
          Certificados
        </h1>
        <div className="mt-12">
          <AreaEmptyState
            title="Nenhum curso matriculado"
            description="Os certificados ficam disponíveis após a matrícula e a conclusão da trilha exigida em cada programa."
          />
          <p className="text-paper-600 mt-6 text-center text-sm">
            <Link href="/cursos" className="text-amber hover:underline">
              Ver cursos disponíveis →
            </Link>
          </p>
        </div>
      </section>
    );
  }

  const totalLessons = enrolled.reduce((n, c) => n + c.lessonCount, 0);
  const completed = enrolled.reduce((n, c) => n + c.completedLessonCount, 0);

  return (
    <section className="fm-site-page py-20">
      <p className="text-amber fm-mono">Credenciais</p>
      <h1 className="text-paper mt-3 font-serif text-3xl md:text-4xl">
        Certificados
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed">
        Progresso atual: {completed} de {totalLessons} aulas em{" "}
        {enrolled.length === 1
          ? "1 curso matriculado"
          : `${enrolled.length} cursos matriculados`}
        . O certificado é emitido automaticamente ao concluir 100% da trilha.
      </p>

      <div className="mt-12">
        {certificates.length === 0 ? (
          <AreaEmptyState
            title="Nenhum certificado emitido"
            description="Conclua todas as aulas do curso para receber o certificado da Escola, com código de validação pública."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {certificates.map((c) => (
              <li
                key={c.hash}
                className="border-paper-100 bg-carbon-elevated border p-6"
              >
                <p className="text-amber fm-mono text-[10px] uppercase tracking-[0.2em]">
                  Certificado de conclusão
                </p>
                <h2 className="text-paper mt-3 font-serif text-xl leading-tight">
                  {c.productName}
                </h2>
                <p className="text-paper-700 mt-2 text-sm">
                  Emitido em {formatDate(c.issuedAt)}
                </p>
                <p className="text-paper-600 mt-1 font-mono text-xs break-all">
                  Código: {c.hash}
                </p>
                <Link
                  href={`/certificado/${c.hash}`}
                  className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono mt-5 inline-block border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors"
                >
                  Ver / validar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
