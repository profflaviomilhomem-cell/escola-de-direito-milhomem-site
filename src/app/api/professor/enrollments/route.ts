import { NextResponse } from "next/server";

import { grantManualAccess } from "@/lib/enrollment/grant-manual-access";
import { listManualEnrollments } from "@/lib/enrollment/list-manual-enrollments";
import { requireProfessorApi } from "@/lib/professor/api-auth";
import { manualEnrollmentSchema } from "@/schemas/manual-enrollment";

export async function GET() {
  const { error } = await requireProfessorApi();
  if (error) return error;

  try {
    const enrollments = await listManualEnrollments(40);
    return NextResponse.json({ enrollments });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar as matrículas." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { session, error } = await requireProfessorApi();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = manualEnrollmentSchema.safeParse(body);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const result = await grantManualAccess({
    grantedByUserId: session!.sub,
    studentEmail: parsed.data.email,
    productSlug: parsed.data.productSlug,
    note: parsed.data.note,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status: result.status },
    );
  }

  if (result.alreadyHadAccess) {
    return NextResponse.json({
      ok: true,
      alreadyHadAccess: true,
      message: result.message,
    });
  }

  const enrollments = await listManualEnrollments(40);

  return NextResponse.json(
    {
      ok: true,
      alreadyHadAccess: false,
      kind: result.kind,
      id: result.id,
      studentEmail: result.studentEmail,
      productSlug: result.productSlug,
      enrollments,
    },
    { status: 201 },
  );
}
