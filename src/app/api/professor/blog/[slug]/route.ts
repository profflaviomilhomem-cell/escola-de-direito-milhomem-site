import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireProfessorApi } from "@/lib/professor/api-auth";
import { getProfessorBlogPostBySlug } from "@/lib/blog/professor";
import {
  deleteBlogPost,
  updateBlogPost,
  type BlogUpsertInput,
} from "@/lib/professor/blog-posts";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug } = await params;
  const post = await getProfessorBlogPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: "Artigo não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PATCH(req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug: currentSlug } = await params;

  const existing = await getProfessorBlogPostBySlug(currentSlug);
  if (!existing) {
    return NextResponse.json({ error: "Artigo não encontrado." }, { status: 404 });
  }

  let body: BlogUpsertInput;
  try {
    body = (await req.json()) as BlogUpsertInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.slug?.trim() || !body.title?.trim() || !body.body?.trim()) {
    return NextResponse.json(
      { error: "Título, slug e corpo são obrigatórios." },
      { status: 400 },
    );
  }

  try {
    const post = await updateBlogPost(existing.id, {
      ...body,
      slug: body.slug.trim(),
      title: body.title.trim(),
    });
    revalidatePath("/blog");
    revalidatePath(`/blog/${currentSlug}`);
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/professor/blog");
    return NextResponse.json({ post });
  } catch (e) {
    const message =
      e instanceof Error && e.message.includes("Unique constraint")
        ? "Já existe outro artigo com este slug."
        : "Não foi possível atualizar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { slug } = await params;

  try {
    await deleteBlogPost(slug);
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/professor/blog");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir o artigo." },
      { status: 500 },
    );
  }
}
