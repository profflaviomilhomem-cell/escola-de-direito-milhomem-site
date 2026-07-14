import type { NextRequest } from "next/server";

export type UtmFields = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

function pickUtm(searchParams: URLSearchParams): UtmFields {
  const utmSource = searchParams.get("utm_source")?.trim();
  const utmMedium = searchParams.get("utm_medium")?.trim();
  const utmCampaign = searchParams.get("utm_campaign")?.trim();

  return {
    ...(utmSource ? { utmSource } : {}),
    ...(utmMedium ? { utmMedium } : {}),
    ...(utmCampaign ? { utmCampaign } : {}),
  };
}

export function utmFromRequest(req: NextRequest): UtmFields {
  return pickUtm(req.nextUrl.searchParams);
}

export function utmFromBody(body: unknown): UtmFields {
  if (!body || typeof body !== "object") return {};
  const record = body as Record<string, unknown>;
  const utmSource =
    typeof record.utmSource === "string" ? record.utmSource.trim() : undefined;
  const utmMedium =
    typeof record.utmMedium === "string" ? record.utmMedium.trim() : undefined;
  const utmCampaign =
    typeof record.utmCampaign === "string"
      ? record.utmCampaign.trim()
      : undefined;

  return {
    ...(utmSource ? { utmSource } : {}),
    ...(utmMedium ? { utmMedium } : {}),
    ...(utmCampaign ? { utmCampaign } : {}),
  };
}

export function mergeUtm(primary: UtmFields, fallback: UtmFields): UtmFields {
  return {
    utmSource: primary.utmSource ?? fallback.utmSource,
    utmMedium: primary.utmMedium ?? fallback.utmMedium,
    utmCampaign: primary.utmCampaign ?? fallback.utmCampaign,
  };
}

/** Persiste UTM no sessionStorage (client) — chaves canônicas. */
export const UTM_STORAGE_KEY = "fm_utm";
