import type { Metadata } from "next";
import Link from "next/link";

import { BlogEditor } from "@/components/professor/blog-editor";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Novo artigo — Painel do professor",
  robots: { index: false, follow: false },
};

export default function NovoArtigoPage() {
  return (
    <section className="fm-site-page py-12">
      <Link
        href="/professor/blog"
        className="text-paper-700 hover:text-amber font-mono text-[10px] tracking-[0.2em] uppercase transition-colors"
      >
        ← Pipeline editorial
      </Link>
      <header className="mt-6 mb-10">
        <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
          Novo artigo
        </p>
        <h1
          className="fm-title-fluid mt-3 font-serif leading-[1.05]"
          style={fmTitleClamp("36px", "4.5vw", "56px")}
        >
          Escrever <em className="text-amber italic">peça nova</em>.
        </h1>
      </header>

      <BlogEditor />
    </section>
  );
}
