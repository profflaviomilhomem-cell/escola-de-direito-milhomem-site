import { ORDER_STATUSES_WITH_ACCESS } from "@/lib/business/commercial-rules";
import type { Course, CourseLesson, CourseModule } from "@/lib/course/types";
import {
  findCourseBySlug,
  findLessonWithCourse,
} from "@/lib/course/aluno-courses";
import {
  getUserProgressMap,
  mergeMockLessonProgress,
  type LessonProgressRow,
} from "@/lib/lessons/progress";
import { prisma } from "@/lib/prisma";

/** Gradiente padrão do hero/card quando o produto não tem `coverGradient`. */
const DEFAULT_COVER = {
  from: "#030024",
  via: "#0c0a38",
  to: "#242A34",
  angle: 135,
} as const;

type ProductWithContent = NonNullable<Awaited<ReturnType<typeof loadProduct>>>;
type ModuleRow = ProductWithContent["modules"][number];
type LessonRow = ModuleRow["lessons"][number];

function loadProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: { lessons: { orderBy: { position: "asc" } } },
      },
      // Aulas sem módulo — viram um módulo sintético (defensivo).
      lessons: {
        where: { moduleId: null },
        orderBy: { position: "asc" },
      },
    },
  });
}

/** Gradiente da capa da aula — decoração derivada da posição do módulo. */
function lessonCover(modulePosition: number): CourseLesson["cover"] {
  return modulePosition <= 1
    ? { from: "#7E510B", to: "#5D3B0D", angle: 135 }
    : { from: "#1F3268", to: "#030024", angle: 135 };
}

function mapLesson(
  row: LessonRow,
  moduleSlug: string,
  moduleTitle: string,
  modulePosition: number,
): CourseLesson {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? row.title,
    durationSec: row.durationSec ?? 0,
    position: row.position,
    moduleSlug,
    moduleTitle,
    status: "nao-iniciada",
    watchedSec: 0,
    cover: lessonCover(modulePosition),
    summary: row.summary ?? "",
    keyPoints: Array.isArray(row.keyPoints) ? (row.keyPoints as string[]) : [],
    materials: Array.isArray(row.materials)
      ? (row.materials as CourseLesson["materials"])
      : [],
    videoSrc: row.videoSrc ?? undefined,
    videoId: row.videoId ?? undefined,
    posterSrc: row.posterImage ?? row.coverImage ?? undefined,
    slidesSrc: row.slidesUrl ?? undefined,
  };
}

function mapModule(row: ModuleRow): CourseModule {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    lessons: row.lessons.map((l) =>
      mapLesson(l, row.slug, row.title, row.position),
    ),
  };
}

function buildCourse(product: ProductWithContent): Course {
  const modules: CourseModule[] = product.modules.map(mapModule);

  // Aulas órfãs (sem módulo) entram num módulo sintético no fim.
  if (product.lessons.length > 0) {
    modules.push({
      slug: "outras-aulas",
      title: "Aulas",
      subtitle: "",
      lessons: product.lessons.map((l) =>
        mapLesson(l, "outras-aulas", "Aulas", modules.length + 1),
      ),
    });
  }

  const allLessons = modules.flatMap((m) => m.lessons);
  const coverImageSrc =
    allLessons.find((l) => l.posterSrc)?.posterSrc ?? undefined;

  const cover =
    (product.coverGradient as Course["cover"] | null) ?? DEFAULT_COVER;

  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    shortTitle: product.shortTitle ?? product.name,
    catalogLabel: product.catalogLabel ?? undefined,
    tagline: product.tagline ?? "",
    description: product.description,
    cover,
    coverImageSrc,
    modules,
    lessonCount: allLessons.length,
    completedLessonCount: 0,
  };
}

/** Aplica o progresso real (UserLessonProgress) sobre as aulas do curso. */
function applyProgress(
  course: Course,
  map: Map<string, LessonProgressRow>,
): Course {
  let completedLessonCount = 0;
  const modules = course.modules.map((mod) => ({
    ...mod,
    lessons: mod.lessons.map((lesson) => {
      const row = map.get(`${course.slug}::${lesson.slug}`) ?? null;
      const merged = mergeMockLessonProgress(lesson, row);
      if (merged.status === "concluida") completedLessonCount += 1;
      return merged;
    }),
  }));
  return { ...course, modules, completedLessonCount };
}

/**
 * Curso lido do banco (Product + Module + Lesson). Quando `userId` é
 * informado, aplica o progresso real do aluno. Cai para o conteúdo
 * estático/importado se o produto não existir no DB ou o banco falhar.
 */
export async function getCourseFromDb(
  slug: string,
  userId?: string,
): Promise<Course | null> {
  let product: ProductWithContent | null = null;
  try {
    product = await loadProduct(slug);
  } catch {
    return findCourseBySlug(slug);
  }
  if (!product) return findCourseBySlug(slug);

  let course = buildCourse(product);
  if (userId) {
    const map = await getUserProgressMap(userId);
    if (map.size > 0) course = applyProgress(course, map);
  }
  return course;
}

/**
 * Aula + curso lidos do banco. Mantém a paridade com `findLessonWithCourse`
 * (estático) para as rotas de `/aluno/aulas/[slug]`.
 */
export async function getLessonFromDb(
  lessonSlug: string,
  userId?: string,
): Promise<{ lesson: CourseLesson; course: Course } | null> {
  let productSlug: string | null = null;
  try {
    // O slug de aula só é único POR PRODUTO (@@unique([productId, slug])), não
    // globalmente. Com mais de um curso, slugs comuns ('aula-01', 'conclusao')
    // colidem — um findFirst sem escopo pegaria uma aula de produto arbitrário.
    // Buscamos todos os candidatos (ordem estável) e, havendo colisão, ficamos
    // com o produto que o usuário realmente tem (pedido PAID/AUTHORIZED).
    const candidates = await prisma.lesson.findMany({
      where: { slug: lessonSlug },
      select: { product: { select: { id: true, slug: true } } },
      orderBy: { productId: "asc" },
    });
    if (candidates.length === 0) return findLessonWithCourse(lessonSlug);

    productSlug = candidates[0]!.product.slug;
    if (candidates.length > 1 && userId) {
      const owned = await prisma.order.findFirst({
        where: {
          userId,
          productId: { in: candidates.map((c) => c.product.id) },
          status: { in: [...ORDER_STATUSES_WITH_ACCESS] },
        },
        select: { productId: true },
      });
      const match = owned
        ? candidates.find((c) => c.product.id === owned.productId)
        : undefined;
      if (match) productSlug = match.product.slug;
    }
  } catch {
    return findLessonWithCourse(lessonSlug);
  }
  if (!productSlug) return findLessonWithCourse(lessonSlug);

  const course = await getCourseFromDb(productSlug, userId);
  if (!course) return findLessonWithCourse(lessonSlug);

  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.slug === lessonSlug);
    if (lesson) return { lesson, course };
  }
  return null;
}
