import { copy } from "@/config/copy";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

type Props = {
  /** Usa depoimentos da home ou textos da landing da edição */
  variant?: "home" | "edicao";
};

export function TestimonialsSection({ variant = "home" }: Props) {
  const home = copy.home.testimonials;
  const ed = copy.edicaoLancamento;

  const eyebrow = variant === "home" ? home.eyebrow : "Turma fundadora";
  const title =
    variant === "home" ? (
      <>
        {home.title}{" "}
        <em className="text-amber italic">{home.titleEmphasis}</em>
      </>
    ) : (
      ed.depoimentosTitle
    );
  const lead = variant === "home" ? home.lead : ed.depoimentosLead;
  const items = home.items;

  return (
    <section
      className="fm-site-section py-16 lg:py-32"
      aria-labelledby="testimonials-title"
    >
      <div className="fm-site-container">
        <p className="text-amber mb-4 font-mono text-[0.625rem] uppercase tracking-[0.2em]">
          {eyebrow}
        </p>
        <h2
          id="testimonials-title"
          className="fm-title-fluid mb-4 font-serif leading-[1.1]"
          style={fmTitleClamp("32px", "4vw", "56px")}
        >
          {title}
        </h2>
        <p className="text-paper-700 mb-12 max-w-2xl text-base leading-relaxed">
          {lead}
        </p>
        <ul className="grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <li
              key={t.name}
              className="border-amber/20 flex flex-col border bg-white/[0.02] p-8 backdrop-blur-sm"
            >
              <blockquote className="text-paper-800 flex-1 text-base leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <footer className="border-paper-100 mt-6 border-t pt-4">
                <p className="text-paper font-medium">{t.name}</p>
                <p className="text-paper-600 mt-1 font-mono text-[0.625rem] uppercase tracking-[0.16em]">
                  {t.role}
                </p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
