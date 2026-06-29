import { NextResponse } from "next/server";
import type { ProductType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireProfessorApi } from "@/lib/professor/api-auth";
import {
  getProfessorCourseBySlug,
  upsertProfessorCourse,
  type CourseUpsertInput,
} from "@/lib/professor/products";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug } = await params;
  const course = await getProfessorCourseBySlug(slug);
  if (!course) {
    return NextResponse.json(
      { error: "Curso não encontrado." },
      { status: 404 },
    );
  }
  return NextResponse.json({ course });
}

export async function PATCH(req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug: currentSlug } = await params;

  const existing = await getProfessorCourseBySlug(currentSlug);
  if (!existing) {
    return NextResponse.json(
      { error: "Curso não encontrado." },
      { status: 404 },
    );
  }

  let body: CourseUpsertInput;
  try {
    body = (await req.json()) as CourseUpsertInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    const course = await upsertProfessorCourse(
      {
        ...body,
        slug: body.slug.trim(),
        name: body.name.trim(),
        type: body.type as ProductType,
        priceCents: Number(body.priceCents) || 0,
      },
      existing.id,
    );
    return NextResponse.json({ course });
  } catch (e) {
    const message =
      e instanceof Error && e.message.includes("Unique constraint")
        ? "Já existe outro curso com este slug."
        : "Não foi possível atualizar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug } = await params;

  try {
    await prisma.product.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir (verifique pedidos vinculados)." },
      { status: 500 },
    );
  }
}
