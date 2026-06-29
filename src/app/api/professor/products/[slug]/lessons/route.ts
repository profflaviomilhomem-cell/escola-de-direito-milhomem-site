import { NextResponse } from "next/server";

import { requireProfessorApi } from "@/lib/professor/api-auth";
import {
  createLesson,
  listProductLessons,
  type LessonInput,
} from "@/lib/professor/lessons";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug } = await params;
  const lessons = await listProductLessons(slug);
  return NextResponse.json({ lessons });
}

export async function POST(req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug } = await params;

  let body: LessonInput;
  try {
    body = (await req.json()) as LessonInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.slug?.trim() || !body.title?.trim()) {
    return NextResponse.json(
      { error: "Título e slug da aula são obrigatórios." },
      { status: 400 },
    );
  }

  try {
    const lesson = await createLesson(slug, {
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
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (e) {
    const message =
      e instanceof Error && e.message.includes("Unique constraint")
        ? "Já existe uma aula com este slug neste curso."
        : "Não foi possível criar a aula.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
