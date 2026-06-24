import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireProfessorApi } from "@/lib/professor/api-auth";
import { getProfessorBlogPosts } from "@/lib/blog/professor";
import {
  createBlogPost,
  resolveAuthorId,
  type BlogUpsertInput,
} from "@/lib/professor/blog-posts";

export async function GET() {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const posts = await getProfessorBlogPosts();
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const { session, error } = await requireProfessorApi();
  if (error) return error;

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
    const authorId = await resolveAuthorId(session);
    const post = await createBlogPost(
      { ...body, slug: body.slug.trim(), title: body.title.trim() },
      authorId,
    );
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/professor/blog");
    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    const message =
      e instanceof Error && e.message.includes("Unique constraint")
        ? "Já existe um artigo com este slug."
        : e instanceof Error && e.message.includes("ADMIN")
          ? e.message
          : "Não foi possível salvar. Verifique o banco (migrate + DATABASE_URL).";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
