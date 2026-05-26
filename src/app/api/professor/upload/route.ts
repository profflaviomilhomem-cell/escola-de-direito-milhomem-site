import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { requireProfessorApi } from "@/lib/professor/api-auth";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Upload de capa/banner para public/images/cursos/ (dev e preview local).
 * Em produção, prefira Blob/CDN — esta rota retorna 403.
 */
export async function POST(req: Request) {
  const { error } = await requireProfessorApi();
  if (error) return error;

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error:
          "Upload local desativado em produção. Use URL de imagem ou configure Blob.",
      },
      { status: 403 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "media");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Use JPEG, PNG ou WebP." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Máximo 3 MB." }, { status: 400 });
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const safeKind = kind.replace(/[^a-z0-9-]/gi, "").slice(0, 24) || "media";
  const filename = `${safeKind}-${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "images", "cursos");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  const url = `/images/cursos/${filename}`;
  return NextResponse.json({ url });
}
