import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSessionFromCookies } from "@/lib/auth/session";
import { userHasAccess } from "@/lib/enrollment";
import {
  createLessonComment,
  listLessonComments,
} from "@/lib/forum/comments";
import { rateLimit } from "@/lib/upstash/rate-limit";

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

  if (!(await userHasAccess(session.sub, productSlug))) {
    return NextResponse.json(
      { ok: false, error: "Sem acesso a este curso." },
      { status: 403 },
    );
  }

  try {
    const comments = await listLessonComments(
      productSlug,
      lessonSlug,
      session.sub,
    );
    return NextResponse.json({ ok: true, comments });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Banco indisponível." },
      { status: 503 },
    );
  }
}

const createSchema = z.object({
  productSlug: z.string().trim().min(1),
  lessonSlug: z.string().trim().min(1),
  content: z.string().trim().min(2).max(4000),
  parentId: z.string().trim().min(1).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const rl = await rateLimit({
    prefix: "forum:comment",
    max: 20,
    window: "5 m",
    key: session.sub,
  });
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: "Muitos comentários em pouco tempo. Aguarde." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload inválido." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  if (!(await userHasAccess(session.sub, parsed.data.productSlug))) {
    return NextResponse.json(
      { ok: false, error: "Sem acesso a este curso." },
      { status: 403 },
    );
  }

  try {
    const result = await createLessonComment({
      userId: session.sub,
      productSlug: parsed.data.productSlug,
      lessonSlug: parsed.data.lessonSlug,
      content: parsed.data.content,
      parentId: parsed.data.parentId ?? null,
    });
    if (!result.ok) {
      const msg =
        result.error === "LESSON_NOT_FOUND"
          ? "Aula não encontrada."
          : "Comentário-pai inválido.";
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
    return NextResponse.json({ ok: true, comment: result.comment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Banco indisponível." },
      { status: 503 },
    );
  }
}
