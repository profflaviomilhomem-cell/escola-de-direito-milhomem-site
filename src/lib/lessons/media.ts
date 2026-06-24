import { prisma } from "@/lib/prisma";

/**
 * Busca o videoId (Cloudflare Stream UID) que o professor cadastrou para a
 * aula no banco. Usado para "ponte" o conteúdo do manifest com o vídeo real.
 * Retorna null se não houver, se a aula não existir, ou se o banco falhar.
 */
export async function getLessonVideoId(
  productSlug: string,
  lessonSlug: string,
): Promise<string | null> {
  try {
    const lesson = await prisma.lesson.findFirst({
      where: { slug: lessonSlug, product: { slug: productSlug } },
      select: { videoId: true },
    });
    return lesson?.videoId ?? null;
  } catch {
    return null;
  }
}
