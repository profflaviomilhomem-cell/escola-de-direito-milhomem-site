import { NextResponse } from "next/server";
import type { ModerationStatus } from "@prisma/client";

import { requireProfessorApi } from "@/lib/professor/api-auth";
import { setCommentModeration } from "@/lib/forum/comments";

const VALID: ModerationStatus[] = ["APPROVED", "PENDING", "REJECTED"];

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { error } = await requireProfessorApi();
  if (error) return error;
  const { id } = await params;

  let body: { status?: string };
  try {
    body = (await req.json()) as { status?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const status = body.status as ModerationStatus | undefined;
  if (!status || !VALID.includes(status)) {
    return NextResponse.json(
      { error: "Status inválido (APPROVED, PENDING ou REJECTED)." },
      { status: 422 },
    );
  }

  try {
    await setCommentModeration(id, status);
    return NextResponse.json({ ok: true, status });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível moderar (comentário inexistente?)." },
      { status: 500 },
    );
  }
}
