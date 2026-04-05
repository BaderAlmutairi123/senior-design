import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getScenarioById, getUserProgress } from "@/lib/scenarios/queries";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import type { QuizQuestion } from "@/types/scenario";

const difficultyConfig = {
  beginner: { color: "text-[#a2f31f]", border: "border-[#a2f31f]", bg: "bg-[#a2f31f]/10", label: "Beginner" },
  intermediate: { color: "text-[#8ff5ff]", border: "border-[#8ff5ff]", bg: "bg-[#8ff5ff]/10", label: "Intermediate" },
  advanced: { color: "text-[#d873ff]", border: "border-[#d873ff]", bg: "bg-[#d873ff]/10", label: "Advanced" },
} as const;

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const scenario = await getScenarioById(id);

  if (!scenario) {
    notFound();
  }

  const progress = await getUserProgress(user.id, scenario.id);

  if (!progress) {
    redirect(`/scenarios/${id}`);
  }

  const content = scenario.content as Record<string, unknown>;
  const questions = (content.questions as QuizQuestion[]) || [];
  const explanations = (content.explanations as string[]) || [];
  const correctAnswersData = (
    scenario.correct_answers as { answers: string[] }
  )?.answers || [];
  const userAnswers = progress.answers as string[];
  const diff = difficultyConfig[scenario.difficulty];
  const percentage = progress.total_questions > 0
    ? Math.round((progress.correct_answers / progress.total_questions) * 100)
    : 0;

  let performanceTier: { label: string; color: string; message: string };
  if (percentage === 100) {
    performanceTier = { label: "PERFECT", color: "text-[#a2f31f]", message: "Outstanding! Full operational mastery achieved." };
  } else if (percentage >= 70) {
    performanceTier = { label: "PROFICIENT", color: "text-[#8ff5ff]", message: "Solid performance. Review missed items to achieve mastery." };
  } else if (percentage >= 40) {
    performanceTier = { label: "DEVELOPING", color: "text-[#d873ff]", message: "Room for improvement. Review intelligence reports and retry." };
  } else {
    performanceTier = { label: "NEEDS TRAINING", color: "text-[#ff716c]", message: "Additional study required. Review all materials before retaking." };
  }

  return (
    <AppShell email={user.email || ""} activePath="/scenarios">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/scenarios"
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#aaabb0] hover:text-[#8ff5ff] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Drills
        </Link>
        <h1 className="font-headline font-bold text-3xl tracking-tighter text-[#f6f6fc]">
          After Action Report
        </h1>
        <p className="mt-2 text-sm text-[#aaabb0]">
          {scenario.title} &mdash; Completed {new Date(progress.completed_at).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric"
          })}
        </p>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111318] border border-[#23262c] p-6 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#aaabb0]">Accuracy</p>
          <p className={`mt-2 text-3xl font-headline font-bold ${performanceTier.color}`}>{percentage}%</p>
          <p className="mt-1 text-xs text-[#aaabb0]">{progress.correct_answers}/{progress.total_questions} correct</p>
        </div>
        <div className="bg-[#111318] border border-[#23262c] p-6 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#aaabb0]">Points Earned</p>
          <p className="mt-2 text-3xl font-headline font-bold text-[#8ff5ff]">{progress.score}</p>
          <p className="mt-1 text-xs text-[#aaabb0]">out of {scenario.points}</p>
        </div>
        <div className="bg-[#111318] border border-[#23262c] p-6 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#aaabb0]">Performance</p>
          <p className={`mt-2 text-xl font-headline font-bold ${performanceTier.color}`}>{performanceTier.label}</p>
          <p className="mt-1 text-xs text-[#aaabb0]">{performanceTier.message}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 bg-[#111318] border border-[#23262c] p-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[#aaabb0] font-mono text-xs uppercase">Accuracy</span>
          <span className={performanceTier.color + " font-mono text-xs"}>{percentage}%</span>
        </div>
        <div className="h-2 w-full bg-[#23262c] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8ff5ff] to-[#a2f31f] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Detailed Review */}
      <div className="bg-[#111318] border border-[#23262c] overflow-hidden">
        <div className="p-6 border-b border-[#23262c] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#d873ff]">assignment</span>
          <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-[#f6f6fc]">
            Detailed Review
          </h2>
        </div>

        <div className="divide-y divide-[#23262c]">
          {questions.map((q, index) => {
            const userAnswer = userAnswers[index] || "";
            const correctAnswer = correctAnswersData[index] || "";
            const isCorrect = userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase();

            return (
              <div key={index} className={`p-6 ${isCorrect ? "border-l-4 border-[#a2f31f]" : "border-l-4 border-[#ff716c]"}`}>
                <div className="mb-4 flex items-start gap-4">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center text-xs font-bold font-mono ${
                    isCorrect
                      ? "bg-[#a2f31f]/20 text-[#a2f31f]"
                      : "bg-[#ff716c]/20 text-[#ff716c]"
                  }`}>
                    {isCorrect ? (
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>close</span>
                    )}
                  </span>
                  <p className="font-headline font-medium text-[#f6f6fc] leading-relaxed">
                    {q.question || q.text || ""}
                  </p>
                </div>

                {q.options && (
                  <div className="ml-12 space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const letter = String(opt).match(/^([A-Z])\)/)?.[1] || "";
                      const isUserAnswer = letter === userAnswer;
                      const isCorrectOption = letter === correctAnswer;

                      let style = "border-[#23262c] bg-[#0c0e12] text-[#46484d]";
                      if (isCorrectOption) {
                        style = "border-[#a2f31f]/40 bg-[#a2f31f]/10 text-[#a2f31f]";
                      } else if (isUserAnswer && !isCorrect) {
                        style = "border-[#ff716c]/40 bg-[#ff716c]/10 text-[#ff716c] line-through";
                      }

                      return (
                        <div key={optIndex} className={`px-4 py-3 text-sm border ${style} flex items-center gap-3`}>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center border text-[10px] font-bold ${
                            isCorrectOption
                              ? "border-[#a2f31f] bg-[#a2f31f] text-[#0c0e12]"
                              : isUserAnswer && !isCorrect
                                ? "border-[#ff716c] bg-[#ff716c] text-[#0c0e12]"
                                : "border-[#46484d]"
                          }`}>
                            {letter}
                          </span>
                          <span className="font-headline text-sm">{String(opt)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="ml-12 mt-3 space-y-3">
                  {isCorrect ? (
                    <p className="text-xs text-[#a2f31f] font-mono flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      CORRECT — You answered {correctAnswer}
                    </p>
                  ) : (
                    <p className="text-xs text-[#ff716c] font-mono flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                      INCORRECT — You answered {userAnswer}, correct: {correctAnswer}
                    </p>
                  )}
                  {explanations[index] && (
                    <div className="p-4 bg-[#0c0e12] border-l-2 border-[#8ff5ff]/30">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8ff5ff] text-sm">lightbulb</span>
                        <span className="text-[10px] font-mono text-[#8ff5ff] uppercase tracking-widest">Intelligence</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#aaabb0]">{explanations[index]}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href={`/scenarios/${scenario.id}`}
          className="px-6 py-3 bg-[#8ff5ff] text-[#005d63] font-headline font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(143,245,255,0.3)] transition-all"
        >
          Review Scenario
        </Link>
        <Link
          href="/scenarios"
          className="px-6 py-3 bg-[#1d2025] border border-[#23262c] text-[#aaabb0] font-headline text-xs uppercase tracking-widest hover:border-[#8ff5ff]/30 hover:text-[#f6f6fc] transition-all"
        >
          Browse More Drills
        </Link>
        <Link
          href="/feedback/submit"
          className="px-6 py-3 bg-[#d873ff]/10 border border-[#d873ff]/30 text-[#d873ff] font-headline text-xs uppercase tracking-widest hover:bg-[#d873ff]/20 transition-all"
        >
          Share Feedback
        </Link>
      </div>
    </AppShell>
  );
}
