import type { Course, CourseLesson } from "@/lib/course/types";
import manifest from "@/data/provas-digitais-manifest.json";

const NAVY = "#030024";
const CARBON = "#242A34";

function lessonFromManifest(
  entry: (typeof manifest.lessons)[number],
  moduleSlug: string,
  moduleTitle: string,
): CourseLesson {
  const materials = entry.slides
    ? [
        {
          title: `Slides — Aula ${entry.number.toString().padStart(2, "0")}`,
          pages: 0,
          sizeKb: Math.round((entry.slides.bytes ?? 0) / 1024),
        },
      ]
    : [];

  return {
    id: `lesson_pd_${entry.slug}`,
    slug: entry.slug,
    title: entry.title,
    description: entry.title,
    durationSec: 50 * 60,
    position: entry.number,
    moduleSlug,
    moduleTitle,
    status: entry.number === 1 ? "em-andamento" : "nao-iniciada",
    watchedSec: entry.number === 1 ? 12 * 60 : 0,
    cover: {
      from: entry.number <= 2 ? "#7E510B" : "#1F3268",
      to: entry.number <= 2 ? "#5D3B0D" : NAVY,
      angle: 135,
    },
    summary: entry.video
      ? `Aula ${entry.number} do curso Prova Digital no Processo Penal — vídeo editado e slides de apoio.`
      : `Aula ${entry.number} — slides disponíveis; vídeo editado pendente de entrega.`,
    keyPoints: [
      entry.slides
        ? "Baixe os slides em Materiais antes ou depois do vídeo."
        : "Slides ainda não importados para esta aula.",
      entry.video
        ? "Vídeo editado carregado a partir do acervo do professor."
        : "Aguardando versão editada do vídeo (só gravação bruta nos arquivos originais).",
    ],
    materials,
    videoSrc: entry.video?.path,
    posterSrc: entry.video?.poster?.path,
    slidesSrc: entry.slides?.path,
  };
}

const activeLessons = manifest.lessons.filter((l) => l.number <= 10);

const mod1Lessons = activeLessons
  .filter((l) => l.number <= 2)
  .map((l) =>
    lessonFromManifest(l, "cadeia-custodia", "I — Cadeia de custódia"),
  );

const mod2Lessons = activeLessons
  .filter((l) => l.number >= 3)
  .map((l) =>
    lessonFromManifest(l, "prova-digital", "II — Prova digital no processo"),
  );

/** Curso importado de public/curso/milhomem — ver `npm run import:provas-digitais`. */
export const provasDigitaisCourse: Course = {
  id: "prod_prova_digital",
  slug: manifest.courseSlug,
  title: manifest.courseName,
  shortTitle: "Prova Digital",
  catalogLabel: "Curso gravado · Prova Digital",
  tagline: "Prova digital e cadeia de custódia — perspectiva da acusação.",
  description:
    "Curso gravado com Flávio Milhomem: validade da prova digital, " +
    "cadeia de custódia e prática no processo penal contemporâneo.",
  cover: { from: NAVY, via: "#0c0a38", to: CARBON, angle: 135 },
  coverImageSrc: activeLessons.find((l) => l.video?.poster?.path)?.video?.poster
    ?.path,
  modules: [
    {
      slug: "cadeia-custodia",
      title: "I — Cadeia de custódia",
      subtitle: "Fundamentos e etapas da cadeia de custódia.",
      lessons: mod1Lessons,
    },
    {
      slug: "prova-digital",
      title: "II — Prova digital no processo",
      subtitle: "Admissibilidade, mensagens, interceptação e valoração.",
      lessons: mod2Lessons,
    },
  ],
  lessonCount: activeLessons.length,
  completedLessonCount: 0,
};
