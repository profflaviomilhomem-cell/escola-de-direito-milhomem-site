import { NextResponse } from "next/server";

import { requireProfessorApi } from "@/lib/professor/api-auth";
import {
  deleteModule,
  moveModule,
  updateModule,
  type ModuleInput,
} from "@/lib/professor/modules";

type Params = { params: Promise<{ slug: string; moduleId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug, moduleId } = await params;

  let body:
    | (ModuleInput & { action?: "move"; direction?: "up" | "down" })
    | null;
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!body) {
    return NextResponse.json({ error: "Corpo ausente." }, { status: 400 });
  }

  // Reordenação (subir/descer) — não exige os campos do módulo.
  if (body.action === "move") {
    if (body.direction !== "up" && body.direction !== "down") {
      return NextResponse.json(
        { error: "Direção inválida (up ou down)." },
        { status: 422 },
      );
    }
    const ok = await moveModule(slug, moduleId, body.direction);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json(
          { error: "Não foi possível reordenar." },
          { status: 400 },
        );
  }

  const title = body.title?.trim();
  const moduleSlug = body.slug?.trim();
  if (!title || !moduleSlug) {
    return NextResponse.json(
      { error: "Título e slug do módulo são obrigatórios." },
      { status: 400 },
    );
  }

  try {
    const mod = await updateModule(slug, moduleId, {
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
    return NextResponse.json({ module: mod });
  } catch (e) {
    const message =
      e instanceof Error && e.message.includes("Unique constraint")
        ? "Já existe outro módulo com este slug neste curso."
        : "Não foi possível atualizar o módulo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug, moduleId } = await params;

  try {
    const ok = await deleteModule(slug, moduleId);
    if (!ok) {
      return NextResponse.json(
        { error: "Curso não encontrado." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir o módulo." },
      { status: 500 },
    );
  }
}
