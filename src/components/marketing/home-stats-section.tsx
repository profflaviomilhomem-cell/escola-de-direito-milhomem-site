type Stat = { readonly val: string; readonly label: string };

type HomeStatsSectionProps = {
  stats: readonly Stat[];
  eyebrow?: string;
};

export function HomeStatsSection({
  stats,
  eyebrow = "Trajetória em números",
}: HomeStatsSectionProps) {
  return (
    <section
      className="relative z-10 px-[5%] pb-14 pt-2 sm:pb-16 sm:pt-4 lg:py-24"
      aria-label={eyebrow}
    >
      <div className="mx-auto max-w-[1200px]">
        <p
          data-reveal
          className="text-amber/90 mb-4 text-center font-mono text-[9px] uppercase tracking-[0.28em] sm:mb-5 sm:text-[10px]"
        >
          {eyebrow}
        </p>

        <div
          data-reveal
          className="fm-home-stats overflow-hidden rounded-md border border-amber/20 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.65)]"
        >
          <div className="grid grid-cols-2 divide-x divide-y divide-amber/15 lg:grid-cols-4 lg:divide-y-0">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="fm-home-stat group relative flex min-h-[5.25rem] flex-col items-center justify-center px-3.5 py-4 text-center sm:min-h-[6.25rem] sm:px-6 sm:py-6 lg:min-h-[7.25rem] lg:px-8 lg:py-8"
              >
                <span
                  className="text-amber relative z-[1] block w-full font-serif leading-none tabular-nums"
                  style={{ fontSize: "clamp(2rem, 6.5vw, 3.5rem)" }}
                >
                  {stat.val}
                </span>
                <p className="text-paper-600 relative z-[1] mx-auto mt-1.5 max-w-[10.5rem] font-mono text-[8px] leading-snug uppercase tracking-[0.13em] sm:mt-2 sm:max-w-[12rem] sm:text-[9px] sm:tracking-[0.16em] lg:max-w-[14rem] lg:text-[10px]">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
