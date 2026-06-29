import {
  QUIZ_AREAS,
  quizPenalQuestions,
  type QuizArea,
} from "@/data/quiz-penal";

export type QuizLevelKey =
  | "iniciante"
  | "intermediario"
  | "avancado"
  | "expert";

export type QuizLevel = {
  key: QuizLevelKey;
  label: string;
  blurb: string;
};

export type AreaResult = {
  area: QuizArea;
  label: string;
  correct: number;
  total: number;
};

export type QuizResult = {
  correct: number;
  total: number;
  pct: number;
  level: QuizLevel;
  areas: AreaResult[];
  /** Área com menor aproveitamento — foco da recomendação. */
  weakest: AreaResult;
  recommendation: string;
};

const LEVELS: { min: number; level: QuizLevel }[] = [
  {
    min: 18,
    level: {
      key: "expert",
      label: "Domínio avançado",
      blurb:
        "Você domina os fundamentos e os pontos sensíveis da prova no processo penal. O próximo passo é o aprofundamento aplicado — construção da tese e valoração da prova em casos reais.",
    },
  },
  {
    min: 14,
    level: {
      key: "avancado",
      label: "Avançado",
      blurb:
        "Base sólida, com lacunas pontuais. Um aprofundamento dirigido às áreas mais frágeis consolida sua atuação técnica.",
    },
  },
  {
    min: 8,
    level: {
      key: "intermediario",
      label: "Intermediário",
      blurb:
        "Você conhece os conceitos centrais, mas há espaço para ganhar densidade — sobretudo onde a prática forense costuma cobrar precisão.",
    },
  },
  {
    min: 0,
    level: {
      key: "iniciante",
      label: "Em construção",
      blurb:
        "Bom ponto de partida. Vale estruturar o estudo a partir dos fundamentos da prova penal e da cadeia de custódia, que sustentam toda a tese.",
    },
  },
];

function levelFor(correct: number): QuizLevel {
  return LEVELS.find((l) => correct >= l.min)!.level;
}

/** Recomendação calibrada pela área mais frágil — honesta, sem promessa. */
function recommendationFor(weakest: AreaResult): string {
  switch (weakest.area) {
    case "cadeia-custodia":
      return "Sua maior lacuna está em cadeia de custódia — exatamente o Módulo I do curso Prova Digital no Processo Penal, que parte dos arts. 158-A a 158-F do CPP.";
    case "prova-digital":
      return "Sua maior lacuna está em prova digital e interceptações — o Módulo II do curso Prova Digital no Processo Penal trata admissibilidade, integridade e valoração desse tipo de prova.";
    case "processo-penal":
      return "Reforce os fundamentos de processo penal; o curso Prova Digital no Processo Penal aplica esses fundamentos à produção e valoração da prova.";
    case "direito-penal":
      return "Reforce a parte geral do direito penal com o material do blog; para a prática da prova, o curso Prova Digital no Processo Penal é o caminho aplicado.";
  }
}

/**
 * Corrige o quiz. `answers[i]` é o índice marcado na questão i (ordem de
 * `quizPenalQuestions`), ou `null` se em branco.
 */
export function scoreQuizPenal(
  answers: ReadonlyArray<number | null>,
): QuizResult {
  const total = quizPenalQuestions.length;

  const tally = new Map<QuizArea, { correct: number; total: number }>();
  let correct = 0;

  quizPenalQuestions.forEach((question, i) => {
    const bucket = tally.get(question.area) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (answers[i] === question.correct) {
      bucket.correct += 1;
      correct += 1;
    }
    tally.set(question.area, bucket);
  });

  const areas: AreaResult[] = (Object.keys(QUIZ_AREAS) as QuizArea[]).map(
    (area) => {
      const b = tally.get(area) ?? { correct: 0, total: 0 };
      return {
        area,
        label: QUIZ_AREAS[area].label,
        correct: b.correct,
        total: b.total,
      };
    },
  );

  // Área mais frágil: menor proporção de acertos; empate → ordem do enum.
  const weakest = areas.reduce((worst, a) =>
    a.correct / a.total < worst.correct / worst.total ? a : worst,
  );

  return {
    correct,
    total,
    pct: Math.round((correct / total) * 100),
    level: levelFor(correct),
    areas,
    weakest,
    recommendation: recommendationFor(weakest),
  };
}
