import type { Metadata } from "next";
import Link from "next/link";

import { BlogEditor } from "@/components/professor/blog-editor";

export const metadata: Metadata = {
  title: "Novo artigo — Painel do professor",
  robots: { index: false, follow: false },
};

export default function NovoArtigoPage() {
  return (
    <section className="px-gutter mx-auto max-w-(--container-narrow) py-12 lg:px-12">
      <Link
        href="/professor/blog"
        className="text-paper-700 hover:text-amber font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
      >
        ← Pipeline editorial
      </Link>
      <header className="mt-6 mb-10">
        <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
          Novo artigo
        </p>
        <h1
          className="mt-3 font-serif leading-[1.05]"
          style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}
        >
          Escrever <em className="text-amber italic">peça nova</em>.
        </h1>
      </header>

      <BlogEditor />
    </section>
  );
}
