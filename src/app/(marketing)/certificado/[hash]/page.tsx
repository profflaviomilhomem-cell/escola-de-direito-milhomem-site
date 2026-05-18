import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: Promise<{ hash: string }> };

export const metadata: Metadata = {
  title: "Validação de certificado",
  robots: { index: false, follow: false },
};

/**
 * Validação pública de certificado — stub até emissão real (Fase LMS).
 */
export default async function CertificadoValidacaoPage({ params }: Props) {
  const { hash } = await params;

  return (
    <article className="fm-site-page max-w-prose py-page text-center">
      <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
        Escola Flávio Milhomem
      </p>
      <h1 className="mt-4 font-serif text-3xl">Validação de certificado</h1>
      <p className="text-paper-700 mt-6 leading-relaxed">
        A verificação online de certificados será habilitada quando a turma
        inaugural concluir a trilha. O código informado foi registrado para
        consulta futura.
      </p>
      <p className="text-paper-500 mt-4 font-mono text-xs break-all">{hash}</p>
      <p className="text-paper-600 mt-10 text-sm">
        Dúvidas?{" "}
        <Link href="/contato" className="text-amber underline-offset-2 hover:underline">
          Entre em contato
        </Link>
        .
      </p>
    </article>
  );
}
