"use client";

import { useState } from "react";
import { submitAnswers } from "./actions";
import type { GradeResult, QuizQuestion, UserProgress } from "@/types/scenario";

interface QuizClientProps {
  scenarioId: string;
  questions: QuizQuestion[];
  maxPoints: number;
  existingProgress: UserProgress | null;
  correctAnswersData: string[];
  explanations?: string[];
}

export default function QuizClient({
  scenarioId,
  questions,
  maxPoints,
  existingProgress,
  correctAnswersData,
  explanations = [],
}: QuizClientProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user already completed this scenario, show previous results
  const showingPrevious = existingProgress && !gradeResult;
  const results = gradeResult
    ? gradeResult
    : existingProgress
      ? buildGradeFromProgress(existingProgress, correctAnswersData, maxPoints)
      : null;

  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);

    const answersArray = questions.map((_, i) => selectedAnswers[i] || "");
    const result = await submitAnswers(scenarioId, answersArray);

    if (!result.success) {
      setError(result.error || "Something went wrong.");
    } else if (result.gradeResult) {
      setGradeResult(result.gradeResult);
    }
    setSubmitting(false);
  }

  function selectAnswer(questionIndex: number, optionLetter: string) {
    if (results) return; // Don't allow changes after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionLetter,
    }));
  }

  function extractLetter(option: string): string {
    const match = option.match(/^([A-Z])\)/);
    return match ? match[1] : "";
  }

  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
          <svg
            className="h-4 w-4 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Questions
        </h2>
        {showingPrevious && (
          <span className="ml-auto rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
            Previously completed
          </span>
        )}
      </div>

      {/* Score banner */}
      {results && (
        <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">
                {showingPrevious ? "Your previous score" : "Your score"}
              </p>
              <p className="mt-1 text-2xl font-bold text-cyan-400">
                {results.correctCount}/{results.totalQuestions} correct
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-400">Points earned</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {results.score}/{maxPoints}
              </p>
            </div>
          </div>
          {results.correctCount === results.totalQuestions && (
            <p className="mt-3 text-sm text-emerald-400">
              Perfect score! You&apos;ve mastered this scenario.
            </p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {questions.map((q, index) => {
          const questionResult = results?.results[index];
          const previousAnswer = existingProgress && !gradeResult
            ? (existingProgress.answers as string[])[index]
            : undefined;

          return (
            <div
              key={index}
              className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5"
            >
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-bold text-cyan-400">
                  {index + 1}
                </span>
                <p className="font-medium leading-relaxed text-zinc-200">
                  {q.question || q.text || ""}
                </p>
              </div>
              {q.options && (
                <div className="ml-10 space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const letter = extractLetter(String(opt));
                    const isSelected = selectedAnswers[index] === letter;
                    const isPreviousAnswer = previousAnswer === letter;
                    const isActive = isSelected || (showingPrevious && isPreviousAnswer);

                    let borderClass =
                      "border-zinc-800/30 hover:border-zinc-700";
                    let bgClass = "bg-zinc-900/20";
                    let textClass = "text-zinc-400 hover:text-zinc-300";

                    if (questionResult) {
                      const isCorrectAnswer =
                        letter === questionResult.correctAnswer;
                      const isUserAnswer =
                        letter === questionResult.userAnswer ||
                        (showingPrevious && isPreviousAnswer);

                      if (isCorrectAnswer) {
                        borderClass = "border-emerald-500/40";
                        bgClass = "bg-emerald-500/10";
                        textClass = "text-emerald-300";
                      } else if (isUserAnswer && !questionResult.isCorrect) {
                        borderClass = "border-red-500/40";
                        bgClass = "bg-red-500/10";
                        textClass = "text-red-300";
                      }
                    } else if (isActive) {
                      borderClass = "border-cyan-500/40";
                      bgClass = "bg-cyan-500/10";
                      textClass = "text-cyan-300";
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => selectAnswer(index, letter)}
                        disabled={!!results}
                        className={`w-full cursor-pointer rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${borderClass} ${bgClass} ${textClass} ${results ? "cursor-default" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                              isActive && !results
                                ? "border-cyan-400 bg-cyan-400 text-zinc-900"
                                : questionResult &&
                                    letter === questionResult.correctAnswer
                                  ? "border-emerald-400 bg-emerald-400 text-zinc-900"
                                  : questionResult &&
                                      (letter === questionResult.userAnswer ||
                                        (showingPrevious && isPreviousAnswer)) &&
                                      !questionResult.isCorrect
                                    ? "border-red-400 bg-red-400 text-zinc-900"
                                    : "border-zinc-600"
                            }`}
                          >
                            {letter}
                          </span>
                          {String(opt)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {questionResult && (
                <div className="ml-10 mt-2 space-y-2">
                  {questionResult.isCorrect ? (
                    <p className="text-xs text-emerald-400">Correct!</p>
                  ) : (
                    <p className="text-xs text-red-400">
                      Incorrect — the correct answer is{" "}
                      {questionResult.correctAnswer}
                    </p>
                  )}
                  {explanations[index] && (
                    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3">
                      <div className="mb-1 flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                        </svg>
                        <span className="text-xs font-medium text-cyan-400">Why?</span>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-400">
                        {explanations[index]}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!results && (
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {submitting ? "Grading..." : "Submit Answers"}
          </button>
          {!allAnswered && (
            <p className="text-xs text-zinc-500">
              Answer all {questions.length} questions to submit
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}
    </section>
  );
}

function buildGradeFromProgress(
  progress: UserProgress,
  correctAnswersData: string[],
  maxPoints: number
): GradeResult {
  const userAnswers = progress.answers as string[];
  return {
    score: progress.score,
    totalQuestions: progress.total_questions,
    correctCount: progress.correct_answers,
    results: correctAnswersData.map((correct, index) => ({
      questionIndex: index,
      userAnswer: userAnswers[index] || "",
      correctAnswer: correct,
      isCorrect:
        (userAnswers[index] || "").trim().toUpperCase() ===
        correct.trim().toUpperCase(),
    })),
  };
}
