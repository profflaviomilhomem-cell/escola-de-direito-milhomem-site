import type { Metadata } from "next";

import { QuizPenal } from "@/components/marketing/quiz-penal";
import { InstitutionalNotice } from "@/components/marketing/institutional-notice";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Qual seu nível em Direito Penal? — teste gratuito",
  description:
    "Teste gratuito de 20 questões em Direito Penal e Processo Penal — cadeia de custódia, prova digital, processo e parte geral. Receba um diagnóstico por área e a trilha de estudo recomendada.",
  alternates: { canonical: "/quiz-penal" },
};

export default function QuizPenalPage() {
  return (
    <section className="fm-site-page py-page max-w-prose-wide">
      <JsonLd
        data={breadcrumbLd([
          { name: "Início", url: "/" },
          { name: "Qual seu nível em Penal?", url: "/quiz-penal" },
        ])}
      />

      <p className="text-amber fm-mono text-[11px] tracking-[0.22em] uppercase">
        Ferramenta gratuita
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("36px", "4.5vw", "52px")}
      >
        Qual seu nível em <em className="text-amber italic">Penal</em>?
      </h1>
      <p className="text-paper-700 mt-5 max-w-prose text-base leading-relaxed">
        Vinte questões de Direito Penal e Processo Penal, da parte geral à prova
        digital, com correção comentada a cada resposta. Ao final, você recebe
        um diagnóstico por área e a trilha de estudo recomendada. Leva cerca de
        cinco minutos.
      </p>

      <QuizPenal />

      <InstitutionalNotice className="mt-14 max-w-2xl" />
    </section>
  );
}
