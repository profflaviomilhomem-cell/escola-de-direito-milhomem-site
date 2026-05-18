import Link from "next/link";

import { blogListHref } from "@/lib/blog/date-filter";

const CHIP =
  "fm-mono shrink-0 border px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] transition-colors sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[0.14em]";
const CHIP_ON = "border-amber bg-amber/10 text-amber";
const CHIP_OFF =
  "border-paper-200/80 text-paper-700 hover:border-amber/60 hover:text-amber";

type BlogDateFilterProps = {
  hasDateFilter: boolean;
  activePeriodo?: string;
  de?: string;
  ate?: string;
  filteredCount: number;
  yearChips: number[];
  presets: ReadonlyArray<{ periodo: string; label: string }>;
};

export function BlogDateFilter({
  hasDateFilter,
  activePeriodo,
  de,
  ate,
  filteredCount,
  yearChips,
  presets,
}: BlogDateFilterProps) {
  return (
    <div
      className="border-paper-100/80 mb-8 border-b pb-5 md:mb-10 md:pb-6"
      aria-label="Filtrar artigos por data"
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <p className="text-paper-600 font-mono text-[9px] uppercase tracking-[0.16em]">
          Período
        </p>
        {hasDateFilter ? (
          <Link
            href="/blog"
            className="text-amber hover:text-amber-soft font-mono text-[9px] uppercase tracking-[0.12em] underline-offset-2 hover:underline"
          >
            Limpar
          </Link>
        ) : null}
      </div>

      <div className="-mx-0.5 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/blog"
          className={`${CHIP} ${!hasDateFilter ? CHIP_ON : CHIP_OFF}`}
        >
          Todas
        </Link>
        {presets.map((p) => {
          const active = activePeriodo === p.periodo;
          return (
            <Link
              key={p.periodo}
              href={blogListHref({ periodo: p.periodo })}
              className={`${CHIP} ${active ? CHIP_ON : CHIP_OFF}`}
            >
              {p.label}
            </Link>
          );
        })}
        {yearChips.map((y) => {
          const key = String(y);
          const active = activePeriodo === key;
          return (
            <Link
              key={key}
              href={blogListHref({ periodo: key })}
              className={`${CHIP} ${active ? CHIP_ON : CHIP_OFF}`}
            >
              {y}
            </Link>
          );
        })}
      </div>

      <details className="group mt-3" open={Boolean(de || ate)}>
        <summary className="text-paper-600 hover:text-paper list-none cursor-pointer font-mono text-[9px] uppercase tracking-[0.14em] [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-1.5">
            Intervalo personalizado
            <span
              className="text-paper-600/70 group-open:rotate-180 transition-transform"
              aria-hidden
            >
              ▾
            </span>
          </span>
        </summary>
        <form
          action="/blog"
          method="get"
          className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <label className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-[11rem]">
            <span className="text-paper-600 shrink-0 font-mono text-[9px] uppercase tracking-[0.1em]">
              De
            </span>
            <input
              type="date"
              name="de"
              defaultValue={de ?? ""}
              className="border-paper-200/80 focus:border-amber bg-carbon text-paper min-w-0 flex-1 border px-2 py-1.5 text-[13px] outline-none"
            />
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-[11rem]">
            <span className="text-paper-600 shrink-0 font-mono text-[9px] uppercase tracking-[0.1em]">
              Até
            </span>
            <input
              type="date"
              name="ate"
              defaultValue={ate ?? ""}
              className="border-paper-200/80 focus:border-amber bg-carbon text-paper min-w-0 flex-1 border px-2 py-1.5 text-[13px] outline-none"
            />
          </label>
          <button
            type="submit"
            className="border-amber/50 text-amber hover:bg-amber/10 fm-mono w-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] transition-colors sm:w-auto"
          >
            Aplicar
          </button>
        </form>
      </details>

      {hasDateFilter ? (
        <p className="text-paper-600 mt-2.5 font-mono text-[10px] leading-snug">
          <span className="text-paper">
            {de
              ? new Date(de + "T12:00:00").toLocaleDateString("pt-BR")
              : "…"}
            {" — "}
            {ate
              ? new Date(ate + "T12:00:00").toLocaleDateString("pt-BR")
              : "…"}
          </span>
          {" · "}
          {filteredCount} artigo{filteredCount === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}
