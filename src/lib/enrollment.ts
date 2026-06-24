import {
  ORDER_STATUSES_WITH_ACCESS,
  productGrantsAccessInMvp,
  productUsesOrderAccess,
  productUsesSubscriptionAccess,
  SUBSCRIPTION_STATUS_WITH_ACCESS,
} from "@/lib/business/commercial-rules";
import {
  enrolledCourses,
  findCourseBySlug,
} from "@/lib/course/aluno-courses";
import {
  getUserProgressMap,
  mergeMockLessonProgress,
} from "@/lib/lessons/progress";
import { prisma } from "@/lib/prisma";

function isDevFakeSession(userId: string) {
  return (
    process.env.NODE_ENV !== "production" &&
    (userId.endsWith("_mock") || userId.includes("user_"))
  );
}

/**
 * Gate de acesso (Fase 1) — ver docs/FASE-1-COMERCIAL.md
 */
export async function userHasAccess(
  userId: string,
  productSlug: string,
): Promise<boolean> {
  if (isDevFakeSession(userId)) return true;

  try {
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true, type: true },
    });

    if (!product) return false;

    if (!productGrantsAccessInMvp(product.type)) return false;

    if (productUsesOrderAccess(product.type)) {
      const order = await prisma.order.findFirst({
        where: {
          userId,
          productId: product.id,
          status: { in: [...ORDER_STATUSES_WITH_ACCESS] },
        },
        select: { id: true },
      });
      return !!order;
    }

    if (productUsesSubscriptionAccess(product.type)) {
      const sub = await prisma.subscription.findFirst({
        where: {
          userId,
          productId: product.id,
          status: SUBSCRIPTION_STATUS_WITH_ACCESS,
        },
        select: { id: true },
      });
      return !!sub;
    }

    return false;
  } catch {
    // Evita travar SSR quando o banco estiver indisponível localmente.
    return process.env.NODE_ENV !== "production";
  }
}

export async function getEnrolledCourseSlugs(userId: string) {
  if (isDevFakeSession(userId)) {
    return enrolledCourses.map((c) => c.slug);
  }

  try {
    const [paidOrders, activeSubs] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId,
          status: { in: [...ORDER_STATUSES_WITH_ACCESS] },
        },
        select: {
          product: {
            select: { slug: true, type: true },
          },
        },
      }),
      prisma.subscription.findMany({
        where: { userId, status: SUBSCRIPTION_STATUS_WITH_ACCESS },
        select: {
          product: {
            select: { slug: true, type: true },
          },
        },
      }),
    ]);

    const slugs = new Set<string>();
    for (const o of paidOrders) slugs.add(o.product.slug);
    for (const s of activeSubs) slugs.add(s.product.slug);
    return Array.from(slugs);
  } catch {
    // Em dev, se o banco falhar, não travar a navegação.
    return [];
  }
}

export async function getEnrolledCourses(userId: string) {
  const slugs = await getEnrolledCourseSlugs(userId);

  // MVP: ainda usamos os cursos mock/importados para conteúdo.
  // A query decide apenas "o que o aluno pode ver".
  const courses = slugs
    .map((slug) => findCourseBySlug(slug))
    .filter((c): c is NonNullable<typeof c> => c != null);

  return courses;
}

/**
 * Cursos matriculados com o progresso real do aluno (UserLessonProgress)
 * aplicado sobre cada aula. Recalcula `completedLessonCount` a partir do DB.
 * Em sessão dev fake, mantém o estado de demonstração do manifest.
 */
export async function getEnrolledCoursesWithProgress(userId: string) {
  const courses = await getEnrolledCourses(userId);
  if (courses.length === 0 || isDevFakeSession(userId)) return courses;

  const map = await getUserProgressMap(userId);
  if (map.size === 0) return courses;

  return courses.map((course) => {
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
  });
}

export async function getUserOrders(userId: string) {
  try {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { slug: true, name: true, type: true } },
      },
    });
  } catch {
    return [];
  }
}

