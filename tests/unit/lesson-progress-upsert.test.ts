import { upsertLessonProgress } from "@/lib/lessons/progress";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    lesson: { findFirst: jest.fn() },
    userLessonProgress: { findUnique: jest.fn(), upsert: jest.fn() },
  },
}));

const lessonFindFirst = prisma.lesson.findFirst as jest.Mock;
const progressFindUnique = prisma.userLessonProgress.findUnique as jest.Mock;
const progressUpsert = prisma.userLessonProgress.upsert as jest.Mock;

const input = (watchedSec?: number, completed?: boolean) => ({
  productSlug: "prova-digital",
  lessonSlug: "aula-1",
  watchedSec,
  completed,
});

beforeEach(() => {
  jest.clearAllMocks();
  lessonFindFirst.mockResolvedValue({
    id: "lesson1",
    slug: "aula-1",
    durationSec: 1000,
  });
  progressUpsert.mockImplementation(({ update }) =>
    Promise.resolve({
      watchedSec: update.watchedSec,
      completedAt: update.completedAt,
      lesson: { slug: "aula-1", durationSec: 1000 },
    }),
  );
});

describe("lib/lessons · upsertLessonProgress · monotonia de watchedSec", () => {
  it("NÃO regride quando o PATCH traz watchedSec menor que o gravado", async () => {
    progressFindUnique.mockResolvedValue({
      watchedSec: 500,
      completedAt: null,
    });
    await upsertLessonProgress("user1", input(120));
    const args = progressUpsert.mock.calls[0]![0];
    expect(args.update.watchedSec).toBe(500);
    expect(args.create.watchedSec).toBe(500);
  });

  it("avança quando o PATCH traz watchedSec maior", async () => {
    progressFindUnique.mockResolvedValue({
      watchedSec: 500,
      completedAt: null,
    });
    await upsertLessonProgress("user1", input(750));
    expect(progressUpsert.mock.calls[0]![0].update.watchedSec).toBe(750);
  });

  it("primeira gravação usa o valor recebido", async () => {
    progressFindUnique.mockResolvedValue(null);
    await upsertLessonProgress("user1", input(300));
    expect(progressUpsert.mock.calls[0]![0].update.watchedSec).toBe(300);
  });
});
