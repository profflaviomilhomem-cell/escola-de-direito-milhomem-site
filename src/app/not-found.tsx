import Link from "next/link";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-prose flex-1 flex-col items-center justify-center px-gutter py-page text-center">
        <p className="text-overline text-dourado-600">Erro 404</p>
        <h1 className="font-serif text-display-2 text-tinta-700 mt-3">
          Página não encontrada
        </h1>
        <p className="text-slate-700 mt-stack max-w-md">
          A página que você procura pode ter sido removida ou nunca existiu.
        </p>
        <Link
          href="/"
          className="bg-tinta-600 hover:bg-tinta-700 mt-stack inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium text-white transition-colors"
        >
          Voltar para a home
        </Link>
      </main>
      <Footer />
    </>
  );
}
