import Link from "next/link";

import type { ProdutoEscola } from "@/data/produtos-escola";

type Props = { produto: ProdutoEscola };

const cardClass = (destaque?: boolean) =>
  `border-paper-100 hover:border-amber/40 block rounded-xl border bg-carbon-elevated/40 p-6 transition-colors ${
    destaque ? "border-amber/35 ring-amber/20 ring-1" : ""
  }`;

function CardInner({ produto }: Props) {
  return (
    <>
      {produto.destaque && (
        <p className="text-amber mb-3 font-mono text-[10px] uppercase tracking-[0.2em]">
          Edição fundadora
        </p>
      )}
      <h2 className="font-serif text-2xl text-paper">{produto.titulo}</h2>
      <p className="text-paper-600 mt-2 text-sm leading-relaxed">{produto.subtitulo}</p>
      <dl className="text-paper-500 mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em]">
        {produto.cargaHoraria && (
          <>
            <dt className="sr-only">Carga horária</dt>
            <dd>{produto.cargaHoraria}</dd>
          </>
        )}
        {produto.ticketLabel && (
          <>
            <dt className="sr-only">Investimento</dt>
            <dd>{produto.ticketLabel}</dd>
          </>
        )}
        {produto.externo && <dd>Eduzz · link externo</dd>}
      </dl>
      <p className="text-amber mt-5 font-mono text-[11px] uppercase tracking-[0.18em]">
        {produto.externo ? "Ver na Eduzz →" : "Saber mais →"}
      </p>
    </>
  );
}

export function CursoVitrineCard({ produto }: Props) {
  if (produto.externo) {
    return (
      <a
        href={produto.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass(produto.destaque)}
      >
        <CardInner produto={produto} />
      </a>
    );
  }

  return (
    <Link href={produto.href} className={cardClass(produto.destaque)}>
      <CardInner produto={produto} />
    </Link>
  );
}
