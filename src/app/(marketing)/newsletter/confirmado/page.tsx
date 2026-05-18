import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inscrição confirmada — Bastidor da Acusação",
  description:
    "Sua inscrição na newsletter Bastidor da Acusação foi confirmada.",
  robots: { index: false, follow: false },
};

type Status = "ok" | "invalid" | "notfound" | "error";

const COPY: Record<
  Status,
  {
    eyebrow: string;
    title: string;
    body: string;
    cta?: { href: string; label: string };
  }
> = {
  ok: {
    eyebrow: "Inscrição validada",
    title: "Pronto. Você entrou para o Bastidor.",
    body: "A próxima edição já está sendo escrita. Em até quinze dias você recebe a análise comentada do informativo mais recente do STJ e STF em matéria penal.",
    cta: { href: "/", label: "Voltar para a Escola" },
  },
  invalid: {
    eyebrow: "Link inválido",
    title: "Esse link de confirmação não pôde ser lido.",
    body: "Pode ser que ele tenha expirado (vale por 48h) ou tenha sido truncado pelo cliente de e-mail. Tente se inscrever novamente — se já estiver na lista, basta repetir o cadastro.",
    cta: { href: "/newsletter", label: "Inscrever de novo" },
  },
  notfound: {
    eyebrow: "Inscrição não encontrada",
    title: "Não localizamos seu cadastro.",
    body: "O link veio de um e-mail antigo ou de uma inscrição cancelada. Faça uma nova inscrição para continuar.",
    cta: { href: "/newsletter", label: "Inscrever de novo" },
  },
  error: {
    eyebrow: "Erro inesperado",
    title: "Algo falhou na confirmação.",
    body: "Tente novamente em alguns minutos. Se persistir, escreva para contato@escolaflaviomilhomem.com.br citando este link.",
  },
};

export default async function ConfirmadoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status: Status =
    params.status === "ok"
      ? "ok"
      : params.status === "invalid"
        ? "invalid"
        : params.status === "notfound"
          ? "notfound"
          : "error";

  const copy = COPY[status];

  return (
    <section className="fm-site-page max-w-prose py-page">
      <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
        {copy.eyebrow}
      </p>
      <h1
        className="mt-3 font-serif leading-[1.05]"
        style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
      >
        {copy.title}
      </h1>
      <p className="mt-stack leading-[1.7]">{copy.body}</p>

      {copy.cta && (
        <Link
          href={copy.cta.href}
          className="border-amber text-paper hover:text-amber mt-stack inline-block border-b font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          {copy.cta.label} →
        </Link>
      )}
    </section>
  );
}
