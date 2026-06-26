import { NextResponse, type NextRequest } from "next/server";

/**
 * POST /api/metrics — recebe pacotes de Core Web Vitals do cliente
 * (`<WebVitalsReporter />`).
 *
 * Por enquanto: validação leve + log estruturado. Em sprints futuras,
 * encaminhar para PostHog/GA4 server-side ou para um sink dedicado
 * (ex.: Cloudflare Analytics Engine), conforme Cap 5.6 do guia.
 */

const ALLOWED_METRICS = new Set(["CLS", "INP", "LCP", "FCP", "TTFB", "FID"]);

type Payload = {
  id?: string;
  name?: string;
  value?: number;
  rating?: string;
  page?: string;
};

export async function POST(req: NextRequest) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body.name || !ALLOWED_METRICS.has(body.name)) {
    return NextResponse.json({ ok: false }, { status: 422 });
  }

  // Log estruturado JSON — Vercel/CloudWatch ingere isso direto.
  console.info(
    JSON.stringify({
      level: "info",
      event: "web_vital",
      metric: body.name,
      value: body.value,
      rating: body.rating,
      page: body.page,
    }),
  );

  return new NextResponse(null, { status: 204 });
}
