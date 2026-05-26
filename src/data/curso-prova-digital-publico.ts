import manifest from "@/data/provas-digitais-manifest.json";

/** Aulas publicadas (importadas em `public/curso/provas-digitais`). */
const LESSON_LIMIT = 10;

const lessons = manifest.lessons.filter((l) => l.number <= LESSON_LIMIT);

export type ModuloProvaDigitalPublico = {
  readonly id: string;
  readonly title: string;
  readonly desc: string;
  readonly lessons: readonly { readonly number: number; readonly title: string }[];
};

/**
 * Ementa real do curso gravado — fonte: `provas-digitais-manifest.json`
 * (gerado por `npm run import:provas-digitais`).
 */
export const provaDigitalModulosPublicos: readonly ModuloProvaDigitalPublico[] = [
  {
    id: "01",
    title: "Cadeia de custódia",
    desc: "Fundamentos da prova digital e da cadeia de custódia: reconhecimento, isolamento e fixação da prova material.",
    lessons: lessons
      .filter((l) => l.number <= 2)
      .map((l) => ({ number: l.number, title: l.title })),
  },
  {
    id: "02",
    title: "Prova digital no processo",
    desc: "Da coleta e laudo pericial à interceptação e valoração — o CPP após a Lei 13.964/2019 e a prática forense.",
    lessons: lessons
      .filter((l) => l.number >= 3)
      .map((l) => ({ number: l.number, title: l.title })),
  },
] as const;

/** Cards da grade na home (título + resumo por módulo). */
export const provaDigitalModuloCards = provaDigitalModulosPublicos.map((m) => ({
  id: m.id,
  title: m.title,
  desc: `${m.desc} ${m.lessons.length} aulas gravadas com vídeo editado e slides.`,
}));
