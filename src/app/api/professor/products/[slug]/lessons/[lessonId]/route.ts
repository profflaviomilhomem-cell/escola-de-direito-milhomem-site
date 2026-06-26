import { NextResponse } from "next/server";

import { requireProfessorApi } from "@/lib/professor/api-auth";
import {
  deleteLesson,
  moveLesson,
  updateLesson,
  type LessonInput,
} from "@/lib/professor/lessons";

type Params = { params: Promise<{ slug: string; lessonId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug, lessonId } = await params;

  let body:
    | (LessonInput & { action?: "move"; direction?: "up" | "down" })
    | null;
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!body) {
    return NextResponse.json({ error: "Corpo ausente." }, { status: 400 });
  }

  // Reordenação (subir/descer) — não exige os campos da aula.
  if (body.action === "move") {
    if (body.direction !== "up" && body.direction !== "down") {
      return NextResponse.json(
        { error: "Direção inválida (up ou down)." },
        { status: 422 },
      );
    }
    const ok = await moveLesson(slug, lessonId, body.direction);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json(
          { error: "Não foi possível reordenar." },
          { status: 400 },
        );
  }

  if (!body.slug?.trim() || !body.title?.trim()) {
    return NextResponse.json(
      { error: "Título e slug da aula são obrigatórios." },
      { status: 400 },
    );
  }

  try {
    const lesson = await updateLesson(slug, lessonId, {
      ...body,
      slug: body.slug.trim(),
      title: body.title.trim(),
    });
    if (!lesson) {
      return NextResponse.json(
        { error: "Curso não encontrado." },
        { status: 404 },
      );
    }
    return NextResponse.json({ lesson });
  } catch (e) {
    const message =
      e instanceof Error && e.message.includes("Unique constraint")
        ? "Já existe outra aula com este slug neste curso."
        : "Não foi possível atualizar a aula.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug, lessonId } = await params;

  try {
    const ok = await deleteLesson(slug, lessonId);
    if (!ok) {
      return NextResponse.json(
        { error: "Curso não encontrado." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível excluir (progresso/comentários vinculados?).",
      },
      { status: 500 },
    );
  }
}
