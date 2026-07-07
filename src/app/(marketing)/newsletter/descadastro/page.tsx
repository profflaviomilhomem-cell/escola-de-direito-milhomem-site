import type { Metadata } from "next";
import Link from "next/link";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Descadastro — Bastidor da Acusação",
  description: "Confirmação de descadastro da newsletter Bastidor da Acusação.",
  robots: { index: false, follow: false },
};

type Status = "ok" | "invalid" | "error";

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
    eyebrow: "Descadastro concluído",
    title: "Pronto. Você não receberá mais nossos e-mails.",
    body: "Removemos seu endereço da lista e interrompemos qualquer sequência em andamento. Sentiremos sua falta — mas respeitamos sua escolha. Se mudar de ideia, é só se inscrever de novo pela página da newsletter.",
    cta: { href: "/newsletter", label: "Voltar para a newsletter" },
  },
  invalid: {
    eyebrow: "Link inválido",
    title: "Esse link de descadastro não pôde ser lido.",
    body: "Pode ser que ele tenha sido truncado pelo cliente de e-mail. Se quiser sair da lista, escreva para contato@escolaflaviomilhomem.com.br que fazemos a remoção manualmente.",
    cta: { href: "/", label: "Voltar para a Escola" },
  },
  error: {
    eyebrow: "Erro inesperado",
    title: "Algo falhou no descadastro.",
    body: "Tente novamente em alguns minutos. Se persistir, escreva para contato@escolaflaviomilhomem.com.br citando este link — resolvemos manualmente.",
  },
};

export default async function DescadastroPage({
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
        : "error";

  const copy = COPY[status];

  return (
    <section className="fm-site-page py-page max-w-prose">
      <p className="text-amber font-mono text-[11px] tracking-[0.2em] uppercase">
        {copy.eyebrow}
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("40px", "5vw", "64px")}
      >
        {copy.title}
      </h1>
      <p className="mt-stack leading-[1.7]">{copy.body}</p>

      {copy.cta && (
        <Link
          href={copy.cta.href}
          className="border-amber text-paper hover:text-amber mt-stack inline-block border-b font-mono text-[11px] tracking-[0.2em] uppercase transition-colors"
        >
          {copy.cta.label} →
        </Link>
      )}
    </section>
  );
}
