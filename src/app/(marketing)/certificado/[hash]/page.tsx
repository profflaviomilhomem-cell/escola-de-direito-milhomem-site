import type { Metadata } from "next";
import Link from "next/link";

import { CertificateDiploma } from "@/components/certificate/certificate-diploma";
import { CertificatePrintButton } from "@/components/certificate/certificate-print-button";
import { siteConfig } from "@/config/site";
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

  const validateUrl = `${siteConfig.url.replace(/^https?:\/\//, "")}/certificado/${certificate.hash}`;

  return (
    <section className="fm-cert-page fm-site-page py-12">
      <div
        data-fm-print-hide
        className="mx-auto flex max-w-[1040px] flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
            Certificado autêntico
          </p>
          <h1 className="text-paper mt-2 font-serif text-2xl md:text-3xl">
            Certificado validado
          </h1>
          <p className="text-paper-700 mt-2 max-w-prose text-sm leading-relaxed">
            Documento verificado no banco de dados da Escola pelo código de
            validação abaixo.
          </p>
        </div>
        <CertificatePrintButton />
      </div>

      <div className="fm-cert-stage mt-8">
        <CertificateDiploma
          userName={certificate.userName}
          productName={certificate.productName}
          issuedAtLabel={formatDate(certificate.issuedAt)}
          hash={certificate.hash}
          validateUrl={validateUrl}
          professorName={siteConfig.professor.fullName}
        />
      </div>

      <p
        data-fm-print-hide
        className="text-paper-600 mt-10 text-center text-sm"
      >
        <Link
          href="/cursos"
          className="text-amber underline-offset-2 hover:underline"
        >
          Conhecer os cursos da Escola →
        </Link>
      </p>
    </section>
  );
}
