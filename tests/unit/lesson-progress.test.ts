import type { MockLesson } from "@/data/mock-aluno";
import { mergeMockLessonProgress } from "@/lib/lessons/progress";

const baseLesson: MockLesson = {
  id: "lesson_test",
  slug: "modulo-1-fundamentos-aula-1",
  title: "Teste",
  description: "…",
  durationSec: 100,
  position: 1,
  moduleSlug: "modulo-1-fundamentos",
  moduleTitle: "Módulo I",
  status: "nao-iniciada",
  watchedSec: 0,
  cover: { from: "#000", to: "#111" },
  summary: "Resumo",
  keyPoints: [],
  materials: [],
};

describe("mergeMockLessonProgress", () => {
  test("retorna o mock sem alteração quando não há progresso", () => {
    expect(mergeMockLessonProgress(baseLesson, null)).toEqual(baseLesson);
  });

  test("marca em andamento com watchedSec parcial", () => {
    const merged = mergeMockLessonProgress(baseLesson, {
      watchedSec: 40,
      completedAt: null,
    });
    expect(merged.status).toBe("em-andamento");
    expect(merged.watchedSec).toBe(40);
  });

  test("marca concluída quando completedAt está definido", () => {
    const merged = mergeMockLessonProgress(baseLesson, {
      watchedSec: 50,
      completedAt: new Date(),
    });
    expect(merged.status).toBe("concluida");
    expect(merged.watchedSec).toBe(100);
  });
});
