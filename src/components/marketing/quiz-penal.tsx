"use client";

import Link from "next/link";
import { useState } from "react";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { CURSO_PRINCIPAL_PATH } from "@/data/produtos-escola";
import { quizPenalQuestions } from "@/data/quiz-penal";
import { scoreQuizPenal } from "@/lib/quiz/penal";

const TOTAL = quizPenalQuestions.length;

export function QuizPenal() {
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(TOTAL).fill(null),
  );
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = quizPenalQuestions[index]!;
  const picked = answers[index];
  const answered = picked !== null;
  const isLast = index === TOTAL - 1;
  const answeredCount = answers.filter((a) => a !== null).length;

  function choose(optionIndex: number) {
    if (answered) return; // trava após responder
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = optionIndex;
      return next;
    });
  }

  function reset() {
    setAnswers(Array(TOTAL).fill(null));
    setIndex(0);
    setFinished(false);
  }

  if (finished) {
    const result = scoreQuizPenal(answers);
    return (
      <div className="mt-10">
        <div className="border-amber/30 bg-amber/[0.06] rounded-xl border p-8">
          <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
            Seu resultado
          </p>
          <p className="mt-3 font-serif text-4xl">
            {result.correct}
            <span className="text-paper-600 text-2xl">
              /{result.total}
            </span>{" "}
            <span className="text-paper-700 text-xl">
              · {result.level.label}
            </span>
          </p>
          <p className="text-paper-700 mt-4 max-w-prose leading-relaxed">
            {result.level.blurb}
          </p>
        </div>

        {/* Aproveitamento por área */}
        <div className="mt-8">
          <h2 className="font-serif text-2xl">Desempenho por área</h2>
          <ul className="mt-5 space-y-4">
            {result.areas.map((a) => {
              const pct = Math.round((a.correct / a.total) * 100);
              return (
                <li key={a.area}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-paper text-sm">{a.label}</span>
                    <span className="text-paper-600 font-mono text-[11px]">
                      {a.correct}/{a.total}
                    </span>
                  </div>
                  <div
                    className="bg-carbon-elevated mt-2 h-1.5 w-full overflow-hidden rounded-full"
                    role="img"
                    aria-label={`${a.label}: ${a.correct} de ${a.total}`}
                  >
                    <div
                      className="bg-amber h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Recomendação */}
        <div className="border-paper-100 mt-8 rounded-xl border p-6">
          <h2 className="font-serif text-xl">Sua recomendação de trilha</h2>
          <p className="text-paper-700 mt-3 max-w-prose text-sm leading-relaxed">
            {result.recommendation}
          </p>
          <Link
            href={CURSO_PRINCIPAL_PATH}
            className="bg-amber text-paper mt-5 inline-block px-6 py-3 font-mono text-[12px] tracking-[0.16em] uppercase"
          >
            Ver o curso recomendado
          </Link>
        </div>

        {/* Captura de e-mail (lead) */}
        <div className="border-paper-100 bg-carbon-elevated/30 mt-8 rounded-xl border p-6">
          <h2 className="font-serif text-xl">
            Receba a trilha e materiais por e-mail
          </h2>
          <p className="text-paper-600 mt-2 max-w-prose text-sm leading-relaxed">
            Enviamos um resumo do seu diagnóstico, a recomendação de estudo e os
            materiais de apoio. Confirmação por e-mail (duplo opt-in).
          </p>
          <div className="mt-5 max-w-md">
            <NewsletterForm source="quiz-penal" />
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="border-paper-200 text-paper-700 hover:border-amber mt-8 border px-6 py-3 font-mono text-[11px] tracking-[0.16em] uppercase"
        >
          Refazer o teste
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* Progresso */}
      <div className="flex items-center justify-between">
        <span className="text-paper-600 font-mono text-[11px] tracking-[0.16em] uppercase">
          Questão {index + 1} de {TOTAL}
        </span>
        <span className="text-paper-600 font-mono text-[11px]">
          {answeredCount}/{TOTAL} respondidas
        </span>
      </div>
      <div className="bg-carbon-elevated mt-3 h-1 w-full overflow-hidden rounded-full">
        <div
          className="bg-amber h-full rounded-full transition-[width]"
          style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
        />
      </div>

      {/* Questão */}
      <fieldset className="mt-8">
        <legend className="font-serif text-2xl leading-snug">
          {question.q}
        </legend>
        <ul className="mt-6 space-y-3">
          {question.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrect = i === question.correct;
            const showState = answered;
            const base =
              "w-full text-left rounded-lg border px-4 py-3 text-sm leading-relaxed transition-colors";
            let cls =
              "border-paper-200 text-paper-700 hover:border-amber hover:text-paper";
            if (showState && isCorrect) {
              cls = "border-sucesso-500 bg-sucesso-500/10 text-paper";
            } else if (showState && isPicked && !isCorrect) {
              cls = "border-alerta-500 bg-alerta-500/10 text-paper";
            } else if (showState) {
              cls = "border-paper-100 text-paper-600";
            }
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => choose(i)}
                  disabled={answered}
                  aria-pressed={isPicked}
                  className={`${base} ${cls} disabled:cursor-default`}
                >
                  <span className="text-paper-500 mr-2 font-mono text-[11px]">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {/* Feedback */}
      {answered && (
        <p
          className="text-paper-600 border-amber/40 mt-5 border-l-2 pl-4 text-sm leading-relaxed"
          aria-live="polite"
        >
          <span
            className={
              picked === question.correct
                ? "text-sucesso-400 font-mono text-[11px] tracking-[0.14em] uppercase"
                : "text-alerta-400 font-mono text-[11px] tracking-[0.14em] uppercase"
            }
          >
            {picked === question.correct
              ? "Correto"
              : "Resposta correta abaixo"}
          </span>
          <br />
          {question.explain}
        </p>
      )}

      {/* Navegação */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="border-paper-200 text-paper-700 hover:border-amber border px-5 py-2.5 font-mono text-[11px] tracking-[0.16em] uppercase disabled:opacity-30"
        >
          ← Voltar
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={() => setFinished(true)}
            disabled={!answered}
            className="bg-amber text-paper px-6 py-2.5 font-mono text-[11px] tracking-[0.16em] uppercase disabled:opacity-40"
          >
            Ver resultado
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(TOTAL - 1, i + 1))}
            disabled={!answered}
            className="bg-amber text-paper px-6 py-2.5 font-mono text-[11px] tracking-[0.16em] uppercase disabled:opacity-40"
          >
            Próxima →
          </button>
        )}
      </div>
    </div>
  );
}
