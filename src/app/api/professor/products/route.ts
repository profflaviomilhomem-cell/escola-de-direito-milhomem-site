import { NextResponse } from "next/server";
import type { ProductType } from "@prisma/client";

import { requireProfessorApi } from "@/lib/professor/api-auth";
import {
  getProfessorCourses,
  upsertProfessorCourse,
  type CourseUpsertInput,
} from "@/lib/professor/products";

export async function GET() {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const courses = await getProfessorCourses();
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const { error } = await requireProfessorApi();
  if (error) return error;

  let body: CourseUpsertInput;
  try {
    body = (await req.json()) as CourseUpsertInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.slug?.trim() || !body.name?.trim()) {
    return NextResponse.json(
      { error: "Nome e slug são obrigatórios." },
      { status: 400 },
    );
  }

  try {
    const course = await upsertProfessorCourse({
      ...body,
      slug: body.slug.trim(),
      name: body.name.trim(),
      type: body.type as ProductType,
      priceCents: Number(body.priceCents) || 0,
    });
    return NextResponse.json({ course }, { status: 201 });
  } catch (e) {
    const message =
      e instanceof Error && e.message.includes("Unique constraint")
        ? "Já existe um curso com este slug."
        : "Não foi possível salvar. Verifique o banco (migrate + DATABASE_URL).";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
