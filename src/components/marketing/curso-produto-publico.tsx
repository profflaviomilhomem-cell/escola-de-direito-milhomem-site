import Link from "next/link";

import type { Product } from "@prisma/client";

type Props = {
  product: Product;
};

function formatPriceBrl(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function CursoProdutoPublico({ product }: Props) {
  return (
    <article className="fm-site-page py-page">
      <p className="text-amber fm-mono text-[11px] uppercase tracking-[0.22em]">
        Curso
      </p>
      <h1 className="text-paper mt-3 font-serif text-4xl leading-tight md:text-5xl">
        {product.name}
      </h1>
      {product.tagline ? (
        <p className="text-paper-700 mt-4 max-w-2xl text-lg leading-relaxed">
          {product.tagline}
        </p>
      ) : null}

      <div className="border-paper-100 bg-carbon-elevated mt-10 max-w-3xl border p-6 md:p-8">
        <p className="text-paper-600 whitespace-pre-wrap text-base leading-relaxed">
          {product.description}
        </p>
        {product.priceCents > 0 ? (
          <p className="text-amber fm-mono mt-6 text-sm uppercase tracking-widest">
            Investimento: {formatPriceBrl(product.priceCents)}
          </p>
        ) : null}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/entrar"
          className="bg-amber text-carbon hover:bg-amber-soft inline-flex px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          Entrar na plataforma
        </Link>
        <Link
          href="/cursos"
          className="border-paper-200 text-paper hover:border-amber inline-flex border px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          Ver todos os cursos
        </Link>
      </div>

      <p className="text-paper-600 mt-8 max-w-xl text-sm">
        Checkout online em implementação. Enquanto isso, matrículas da turma
        fundadora seguem pelos canais indicados na Edição Lançamento.
      </p>
    </article>
  );
}
