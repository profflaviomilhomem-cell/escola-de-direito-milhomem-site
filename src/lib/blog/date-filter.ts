/** yyyy-mm-dd no fuso local */
export function toYmdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isValidYmd(s: string | null | undefined): s is string {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = new Date(s + "T12:00:00");
  return !Number.isNaN(t.getTime());
}

/** Início do dia local (ms) */
function startOfLocalDay(ymd: string): number {
  return new Date(ymd + "T00:00:00").getTime();
}

/** Fim do dia local (ms) */
function endOfLocalDay(ymd: string): number {
  return new Date(ymd + "T23:59:59.999").getTime();
}

export function filterPostsByPublishedRange<T extends { publishedAt?: string }>(
  list: T[],
  fromYmd: string | null,
  toYmd: string | null,
): T[] {
  if (!fromYmd && !toYmd) return list;
  const fromMs = fromYmd ? startOfLocalDay(fromYmd) : -Infinity;
  const toMs = toYmd ? endOfLocalDay(toYmd) : Infinity;
  return list.filter((p) => {
    if (!p.publishedAt) return false;
    const t = new Date(p.publishedAt).getTime();
    return t >= fromMs && t <= toMs;
  });
}

export type BlogDateSearch = {
  page?: string;
  de?: string;
  ate?: string;
  periodo?: string;
};

/** Resolve `periodo` em intervalo [de, ate] em yyyy-mm-dd local. */
export function resolveDateRangeFromSearchParams(
  sp: BlogDateSearch,
): { de: string | null; ate: string | null; periodo: string | null } {
  const periodo = sp.periodo?.trim() || null;
  const now = new Date();

  if (periodo === "7d" || periodo === "30d" || periodo === "90d" || periodo === "365d") {
    const days =
      periodo === "7d"
        ? 7
        : periodo === "30d"
          ? 30
          : periodo === "90d"
            ? 90
            : 365;
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    const de = toYmdLocal(start);
    const ate = toYmdLocal(now);
    return { de, ate, periodo };
  }

  if (periodo === "ano-atual") {
    const de = `${now.getFullYear()}-01-01`;
    const ate = toYmdLocal(now);
    return { de, ate, periodo };
  }

  if (periodo && /^\d{4}$/.test(periodo)) {
    const y = periodo;
    return { de: `${y}-01-01`, ate: `${y}-12-31`, periodo };
  }

  let de = isValidYmd(sp.de) ? sp.de! : null;
  let ate = isValidYmd(sp.ate) ? sp.ate! : null;

  if (de && ate && startOfLocalDay(de) > endOfLocalDay(ate)) {
    const t = de;
    de = ate;
    ate = t;
  }

  return { de, ate, periodo: null };
}

export function blogListHref(opts: {
  page?: number;
  de?: string | null;
  ate?: string | null;
  periodo?: string | null;
}): string {
  const params = new URLSearchParams();
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  if (opts.periodo) {
    params.set("periodo", opts.periodo);
  } else {
    if (opts.de) params.set("de", opts.de);
    if (opts.ate) params.set("ate", opts.ate);
  }
  const q = params.toString();
  return q ? `/blog?${q}` : "/blog";
}
