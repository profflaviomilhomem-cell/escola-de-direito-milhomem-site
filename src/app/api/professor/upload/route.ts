import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { requireProfessorApi } from "@/lib/professor/api-auth";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Upload de capa/banner.
 * - Produção/preview com `BLOB_READ_WRITE_TOKEN`: envia ao Vercel Blob (CDN).
 * - Dev local sem token: grava em public/images/cursos/.
 * - Produção sem token: 403 com instrução.
 */
export async function POST(req: Request) {
  const { error } = await requireProfessorApi();
  if (error) return error;

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

  // 1) Vercel Blob (CDN) quando configurado — caminho de produção.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`cursos/${filename}`, file, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    } catch {
      return NextResponse.json(
        { error: "Falha ao enviar para o Blob." },
        { status: 502 },
      );
    }
  }

  // 2) Sem Blob em produção: bloqueia com instrução clara.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error:
          "Configure BLOB_READ_WRITE_TOKEN (Vercel Blob) para enviar imagens em produção, ou cole uma URL.",
      },
      { status: 403 },
    );
  }

  // 3) Dev/preview local: grava no filesystem.
  const dir = path.join(process.cwd(), "public", "images", "cursos");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return NextResponse.json({ url: `/images/cursos/${filename}` });
}
