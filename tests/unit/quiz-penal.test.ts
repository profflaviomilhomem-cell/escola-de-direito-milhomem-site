import { quizPenalQuestions } from "@/data/quiz-penal";
import { scoreQuizPenal } from "@/lib/quiz/penal";

const allCorrect = quizPenalQuestions.map((q) => q.correct);
const allWrong = quizPenalQuestions.map((q) => (q.correct === 0 ? 1 : 0));

describe("scoreQuizPenal", () => {
  it("pontua gabarito completo como nível expert", () => {
    const r = scoreQuizPenal(allCorrect);
    expect(r.correct).toBe(quizPenalQuestions.length);
    expect(r.pct).toBe(100);
    expect(r.level.key).toBe("expert");
  });

  it("pontua tudo errado como nível iniciante", () => {
    const r = scoreQuizPenal(allWrong);
    expect(r.correct).toBe(0);
    expect(r.level.key).toBe("iniciante");
  });

  it("trata respostas em branco (null) como erro", () => {
    const blanks = Array(quizPenalQuestions.length).fill(null);
    const r = scoreQuizPenal(blanks);
    expect(r.correct).toBe(0);
  });

  it("identifica a área mais frágil para a recomendação", () => {
    // Acerta tudo, exceto as questões de cadeia de custódia.
    const answers = quizPenalQuestions.map((q) =>
      q.area === "cadeia-custodia" ? (q.correct === 0 ? 1 : 0) : q.correct,
    );
    const r = scoreQuizPenal(answers);
    expect(r.weakest.area).toBe("cadeia-custodia");
    expect(r.recommendation).toMatch(/cadeia de cust/i);
  });

  it("cobre as quatro áreas, com 20 questões no total", () => {
    const r = scoreQuizPenal(allCorrect);
    expect(r.areas).toHaveLength(4);
    expect(r.areas.reduce((s, a) => s + a.total, 0)).toBe(20);
  });
});
