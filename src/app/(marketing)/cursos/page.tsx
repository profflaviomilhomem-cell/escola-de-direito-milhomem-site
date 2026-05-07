import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Vitrine dos cursos da Escola Flávio Milhomem — Edição Lançamento, produtos legados Eduzz, e ondas futuras.",
  alternates: { canonical: "/cursos" },
};

/**
 * Vitrine de cursos (blueprint Seção 8.3).
 * No lançamento: Edição Lançamento destacada + produtos Eduzz secundários.
 * Filtro por área (Penal, Processual, Militar) em ondas futuras.
 */
export default function CursosPage() {
  return (
    <section className="mx-auto max-w-(--container-narrow) px-gutter py-page">
      <h1 className="font-serif text-heading-1 text-tinta-700">Cursos</h1>
      <p className="text-slate-700 mt-2">
        Vitrine em construção — Edição Lançamento abre inscrições em junho.
      </p>
    </section>
  );
}
