import { NextResponse, type NextRequest } from "next/server";

import { calcular } from "@/lib/business/dosimetria";
import { calculadoraSchema } from "@/schemas/calculadora";

/**
 * POST /api/calculadora — dosimetria didática trifásica.
 *
 * Cálculo determinístico no servidor. O cliente envia escolhas do
 * wizard, validamos via Zod e devolvemos os 3 passos + pena final
 * formatada para exibição.
 */
export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload inválido" },
      { status: 400 },
    );
  }

  const parsed = calculadoraSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const resultado = calcular(parsed.data);
    return NextResponse.json({ ok: true, resultado });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Erro no cálculo",
      },
      { status: 422 },
    );
  }
}
