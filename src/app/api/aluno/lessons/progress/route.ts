import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSessionFromCookies } from "@/lib/auth/session";
import {
  getLessonProgress,
  upsertLessonProgress,
} from "@/lib/lessons/progress";
import { rateLimit } from "@/lib/upstash/rate-limit";
import { lessonProgressUpsertSchema } from "@/schemas/lesson-progress";

/**
 * GET /api/aluno/lessons/progress?productSlug=&lessonSlug=
 * PATCH /api/aluno/lessons/progress — persiste watchedSec / conclusão.
 */
export async function GET(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const productSlug = req.nextUrl.searchParams.get("productSlug")?.trim();
  const lessonSlug = req.nextUrl.searchParams.get("lessonSlug")?.trim();
  if (!productSlug || !lessonSlug) {
    return NextResponse.json(
      { ok: false, error: "Informe productSlug e lessonSlug." },
      { status: 400 },
    );
  }

  try {
    const progress = await getLessonProgress(
      session.sub,
      productSlug,
      lessonSlug,
    );
    return NextResponse.json({ ok: true, progress });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Banco indisponível." },
      { status: 503 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const rl = await rateLimit({
    prefix: "aluno:lesson-progress",
    max: 60,
    window: "1 m",
    key: session.sub,
  });
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: "Muitas atualizações. Aguarde um momento." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload inválido." },
      { status: 400 },
    );
  }

  const parsed = lessonProgressUpsertSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const result = await upsertLessonProgress(session.sub, parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Aula não encontrada no catálogo. Execute o seed do curso mock.",
          code: result.error,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      progress: {
        watchedSec: result.progress.watchedSec,
        completedAt: result.progress.completedAt?.toISOString() ?? null,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Banco indisponível." },
      { status: 503 },
    );
  }
}
