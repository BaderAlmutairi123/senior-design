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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (results) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionLetter }));
  }

  function extractLetter(option: string): string {
    const match = option.match(/^([A-Z])\)/);
    return match ? match[1] : "";
  }

  return (
    <div className="bg-[#111318] border border-[#23262c] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#23262c] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#d873ff]" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
          <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-[#f6f6fc]">
            Quiz
          </h2>
        </div>
        {showingPrevious && (
          <span className="text-[9px] px-2 py-1 border border-[#a2f31f]/30 text-[#a2f31f] bg-[#a2f31f]/5 uppercase font-mono">
            Previously Completed
          </span>
        )}
      </div>

      {/* Score banner */}
      {results && (
        <div className="p-6 border-b border-[#23262c] bg-[#8ff5ff]/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#aaabb0]">
                {showingPrevious ? "Previous Score" : "Your Score"}
              </p>
              <p className="mt-1 text-2xl font-headline font-bold text-[#8ff5ff]">
                {results.correctCount}/{results.totalQuestions} correct
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#aaabb0]">Points Earned</p>
              <p className="mt-1 text-2xl font-headline font-bold text-[#a2f31f]">
                {results.score}/{maxPoints}
              </p>
            </div>
          </div>
          {results.correctCount === results.totalQuestions && (
            <p className="mt-3 text-sm text-[#a2f31f] font-headline flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              Perfect score! Great job.
            </p>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="divide-y divide-[#23262c]">
        {questions.map((q, index) => {
          const questionResult = results?.results[index];
          const previousAnswer = existingProgress && !gradeResult
            ? (existingProgress.answers as string[])[index]
            : undefined;

          return (
            <div key={index} className="p-6">
              <div className="mb-4 flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#8ff5ff]/10 border border-[#8ff5ff]/20 text-xs font-bold text-[#8ff5ff] font-mono">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="font-headline font-medium text-[#f6f6fc] leading-relaxed">
                  {q.question || q.text || ""}
                </p>
              </div>

              {q.options && (
                <div className="ml-12 space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const letter = extractLetter(String(opt));
                    const isSelected = selectedAnswers[index] === letter;
                    const isPreviousAnswer = previousAnswer === letter;
                    const isActive = isSelected || (showingPrevious && isPreviousAnswer);

                    let borderClass = "border-[#23262c] hover:border-[#46484d]";
                    let bgClass = "bg-[#0c0e12]";
                    let textClass = "text-[#aaabb0] hover:text-[#f6f6fc]";

                    if (questionResult) {
                      const isCorrectAnswer = letter === questionResult.correctAnswer;
                      const isUserAnswer = letter === questionResult.userAnswer || (showingPrevious && isPreviousAnswer);

                      if (isCorrectAnswer) {
                        borderClass = "border-[#a2f31f]/40";
                        bgClass = "bg-[#a2f31f]/10";
                        textClass = "text-[#a2f31f]";
                      } else if (isUserAnswer && !questionResult.isCorrect) {
                        borderClass = "border-[#ff716c]/40";
                        bgClass = "bg-[#ff716c]/10";
                        textClass = "text-[#ff716c] line-through";
                      }
                    } else if (isActive) {
                      borderClass = "border-[#8ff5ff]/40";
                      bgClass = "bg-[#8ff5ff]/10";
                      textClass = "text-[#8ff5ff]";
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => selectAnswer(index, letter)}
                        disabled={!!results}
                        className={`group flex items-start gap-4 w-full p-4 text-left border transition-all duration-200 ${borderClass} ${bgClass} ${textClass} ${results ? "cursor-default" : "cursor-pointer"}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center border text-xs font-bold font-mono ${
                          questionResult && letter === questionResult.correctAnswer
                            ? "border-[#a2f31f] bg-[#a2f31f] text-[#0c0e12]"
                            : questionResult && (letter === questionResult.userAnswer || (showingPrevious && isPreviousAnswer)) && !questionResult.isCorrect
                              ? "border-[#ff716c] bg-[#ff716c] text-[#0c0e12]"
                              : isActive && !results
                                ? "border-[#8ff5ff] bg-[#8ff5ff] text-[#0c0e12]"
                                : "border-[#46484d]"
                        }`}>
                          {letter}
                        </span>
                        <span className="flex-1 font-headline text-sm">{String(opt)}</span>
                        {!results && (
                          <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity text-[#8ff5ff]">
                            arrow_forward_ios
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Result feedback */}
              {questionResult && (
                <div className="ml-12 mt-3 space-y-3">
                  {questionResult.isCorrect ? (
                    <p className="text-xs text-[#a2f31f] flex items-center gap-2 font-mono">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      CORRECT
                    </p>
                  ) : (
                    <p className="text-xs text-[#ff716c] flex items-center gap-2 font-mono">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                      INCORRECT — Correct answer: {questionResult.correctAnswer}
                    </p>
                  )}
                  {explanations[index] && (
                    <div className="p-4 bg-[#0c0e12] border-l-2 border-[#8ff5ff]/30">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8ff5ff] text-sm">lightbulb</span>
                        <span className="text-[10px] font-mono text-[#8ff5ff] uppercase tracking-widest">Explanation</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#aaabb0]">
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
        <div className="p-6 border-t border-[#23262c] flex items-center gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="px-8 py-3 bg-[#a2f31f] text-[#294300] font-headline font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(162,243,31,0.3)] active:scale-95"
          >
            {submitting ? "Grading..." : "Submit Answers"}
          </button>
          {!allAnswered && (
            <p className="text-[10px] font-mono text-[#aaabb0] uppercase tracking-widest">
              Answer all {questions.length} questions to submit
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="px-6 pb-6">
          <p className="text-sm text-[#ff716c] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </p>
        </div>
      )}
    </div>
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
