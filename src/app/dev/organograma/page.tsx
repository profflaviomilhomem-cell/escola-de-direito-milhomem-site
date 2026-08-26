import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

/**
 * Organograma & Checklist MESTRE — exibe `organograma-checklist.html`
 * (~308 nós gerados do livro-guia) via <iframe>, servido por
 * `/dev/organograma/master`. Substitui o renderizador antigo que só
 * mostrava os ~101 itens do markdown de fases.
 *
 * Ferramenta interna de desenvolvimento (no-index).
 *
 * 26/08/2026 — **respondia 200 em produção, sem login.** `/dev` e `/dev/sessao`
 * já abortavam fora de desenvolvimento; esta página tinha ficado de fora do
 * padrão. Hoje ela vaza pouco, porque a fonte (`docs/`) saiu do versionamento e
 * `/dev/organograma/master` devolve 404 — mas o conteúdo que ela existe para
 * exibir é o roteiro interno do negócio, e `noindex` não é controle de acesso:
 * pede gentileza ao buscador e não impede ninguém de abrir o endereço.
 */
export const metadata: Metadata = {
  title: "Organograma Mestre (308 nós)",
  robots: { index: false, follow: false },
};

export default function OrganogramaPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#030024]">
      <div className="flex items-center justify-between gap-4 border-b border-[#f1bb41]/20 bg-[#030024] px-4 py-2">
        <span className="font-mono text-[11px] tracking-[0.2em] text-[#f1bb41] uppercase">
          Organograma &amp; Checklist Mestre · 308 nós (livro-guia)
        </span>
        <Link
          href="/dev"
          className="font-mono text-[11px] tracking-[0.18em] text-[#e0e0e0]/70 uppercase hover:text-[#f1bb41]"
        >
          ← Dev
        </Link>
      </div>
      <iframe
        src="/dev/organograma/master"
        title="Organograma & Checklist Mestre (308 nós)"
        className="min-h-0 w-full flex-1 border-0"
      />
    </div>
  );
}
