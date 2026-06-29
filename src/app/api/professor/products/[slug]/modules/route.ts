import { NextResponse } from "next/server";

import { requireProfessorApi } from "@/lib/professor/api-auth";
import {
  createModule,
  listProductModules,
  type ModuleInput,
} from "@/lib/professor/modules";
import { slugifyCourseName } from "@/lib/professor/product-types";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug } = await params;
  const modules = await listProductModules(slug);
  return NextResponse.json({ modules });
}

export async function POST(req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug } = await params;

  let body: ModuleInput;
  try {
    body = (await req.json()) as ModuleInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json(
      { error: "Título do módulo é obrigatório." },
      { status: 400 },
    );
  }
  const moduleSlug = body.slug?.trim() || slugifyCourseName(title);

  try {
    const mod = await createModule(slug, {
      ...body,
      slug: moduleSlug,
      title,
    });
    if (!mod) {
      return NextResponse.json(
        { error: "Curso não encontrado." },
        { status: 404 },
      );
    }
    return NextResponse.json({ module: mod }, { status: 201 });
  } catch (e) {
    const message =
      e instanceof Error && e.message.includes("Unique constraint")
        ? "Já existe um módulo com este slug neste curso."
        : "Não foi possível criar o módulo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
