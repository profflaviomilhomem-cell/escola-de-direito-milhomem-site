import type { Metadata } from "next";
import Link from "next/link";

import { getCertificateByHash } from "@/lib/certificates";

type Props = { params: Promise<{ hash: string }> };

export const metadata: Metadata = {
  title: "Validação de certificado",
  robots: { index: false, follow: false },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Validação pública de certificado — consulta o banco pelo hash. */
export default async function CertificadoValidacaoPage({ params }: Props) {
  const { hash } = await params;
  const certificate = await getCertificateByHash(hash);

  if (!certificate) {
    return (
      <article className="fm-site-page max-w-prose py-page text-center">
        <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
          Escola Flávio Milhomem
        </p>
        <h1 className="mt-4 font-serif text-3xl">Certificado não encontrado</h1>
        <p className="text-paper-700 mt-6 leading-relaxed">
          Não localizamos um certificado válido para este código. Confira se o
          link foi copiado por inteiro.
        </p>
        <p className="text-paper-500 mt-4 font-mono text-xs break-all">{hash}</p>
        <p className="text-paper-600 mt-10 text-sm">
          Dúvidas?{" "}
          <Link
            href="/contato"
            className="text-amber underline-offset-2 hover:underline"
          >
            Entre em contato
          </Link>
          .
        </p>
      </article>
    );
  }

  return (
    <article className="fm-site-page max-w-prose py-page text-center">
      <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
        Escola Flávio Milhomem · Certificado autêntico
      </p>
      <h1 className="mt-4 font-serif text-3xl">Certificado validado</h1>
      <p className="text-paper-700 mt-8 leading-relaxed">
        Certificamos que
      </p>
      <p className="text-paper mt-2 font-serif text-2xl">
        {certificate.userName}
      </p>
      <p className="text-paper-700 mt-2 leading-relaxed">
        concluiu o curso
      </p>
      <p className="text-amber mt-2 font-serif text-xl">
        {certificate.productName}
      </p>
      <p className="text-paper-700 mt-6 text-sm">
        Emitido em {formatDate(certificate.issuedAt)}
      </p>
      <p className="text-paper-500 mt-2 font-mono text-xs break-all">
        Código de validação: {certificate.hash}
      </p>
      <p className="text-paper-600 mt-10 text-sm">
        <Link
          href="/cursos"
          className="text-amber underline-offset-2 hover:underline"
        >
          Conhecer os cursos da Escola →
        </Link>
      </p>
    </article>
  );
}
