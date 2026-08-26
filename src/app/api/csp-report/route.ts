import { NextResponse, type NextRequest } from "next/server";

/**
 * Receptor dos relatórios da Content-Security-Policy.
 *
 * Enquanto a CSP está em Report-Only (ver `src/lib/security/headers.ts`), o
 * browser manda para cá tudo o que a política **teria** bloqueado. É esse
 * acúmulo que vira a evidência para promover a política a enforcing: sem ele,
 * ligar o bloqueio é adivinhação.
 *
 * O browser envia `application/csp-report` (formato antigo) ou
 * `application/reports+json` (Reporting API). Os dois são aceitos.
 *
 * Sem Sentry configurado, o destino é o log da função na Vercel — que é onde
 * o resto dos erros do projeto já vive hoje. Quando houver DSN, este é um dos
 * pontos que passa a encaminhar.
 */

/** Ruído conhecido: extensão de browser não é violação do nosso site. */
const IGNORED_SCHEMES = [
  "chrome-extension:",
  "moz-extension:",
  "safari-extension:",
  "about:",
];

type CspReportBody = {
  "csp-report"?: Record<string, unknown>;
};

function isNoise(blockedUri: unknown): boolean {
  if (typeof blockedUri !== "string") return false;
  return IGNORED_SCHEMES.some((scheme) => blockedUri.startsWith(scheme));
}

export async function POST(req: NextRequest) {
  // Corpo grande aqui é abuso, não relatório: o browser manda alguns KB.
  const raw = await req.text().catch(() => "");
  if (!raw || raw.length > 16_000) {
    return new NextResponse(null, { status: 204 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  // Formato antigo: { "csp-report": {...} }. Reporting API: [ { body: {...} } ].
  const reports: Record<string, unknown>[] = Array.isArray(parsed)
    ? parsed
        .map((entry) =>
          entry && typeof entry === "object" && "body" in entry
            ? ((entry as { body: Record<string, unknown> }).body ?? {})
            : {},
        )
        .filter((r) => Object.keys(r).length > 0)
    : [(parsed as CspReportBody)?.["csp-report"] ?? {}].filter(
        (r) => Object.keys(r).length > 0,
      );

  for (const report of reports) {
    const blockedUri =
      report["blocked-uri"] ?? report.blockedURL ?? "(desconhecido)";
    if (isNoise(blockedUri)) continue;

    const directive =
      report["violated-directive"] ??
      report.effectiveDirective ??
      "(sem diretiva)";
    const documentUri =
      report["document-uri"] ?? report.documentURL ?? "(sem documento)";

    console.warn(
      "[csp] violação — diretiva=%s bloqueado=%s documento=%s",
      String(directive),
      String(blockedUri),
      String(documentUri),
    );
  }

  // 204 sempre: o browser não trata a resposta, e devolver erro só gera
  // reenvio inútil.
  return new NextResponse(null, { status: 204 });
}
