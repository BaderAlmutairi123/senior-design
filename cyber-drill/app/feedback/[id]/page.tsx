import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getScenarioById, getUserProgress } from "@/lib/scenarios/queries";
import Link from "next/link";
import type { QuizQuestion } from "@/types/scenario";

const difficultyConfig = {
  beginner: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  intermediate: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  advanced: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
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

  // Determine performance tier
  let performanceTier: { label: string; color: string; message: string };
  if (percentage === 100) {
    performanceTier = {
      label: "Perfect",
      color: "text-emerald-400",
      message: "Outstanding! You have a strong understanding of this topic.",
    };
  } else if (percentage >= 70) {
    performanceTier = {
      label: "Good",
      color: "text-cyan-400",
      message: "Well done! Review the questions you missed to strengthen your knowledge.",
    };
  } else if (percentage >= 40) {
    performanceTier = {
      label: "Needs Improvement",
      color: "text-amber-400",
      message: "You're getting there. Consider reviewing the background material and trying again.",
    };
  } else {
    performanceTier = {
      label: "Keep Practicing",
      color: "text-red-400",
      message: "This topic needs more study. Review the instructions and background, then retake the drill.",
    };
  }

  return (
    <div className="cyber-grid min-h-screen bg-[#0a0a0f]">
      {/* Decorative glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <span className="gradient-text text-lg font-bold tracking-tight">CyberDrill</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 pulse-glow" />
              <span className="text-sm text-zinc-400">{user.email}</span>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-xl border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* Back link */}
        <Link
          href="/scenarios"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-cyan-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Scenarios
        </Link>

        {/* Feedback header */}
        <div className="glass mb-8 rounded-2xl p-8">
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${diff.bg} ${diff.color}`}>
              {scenario.difficulty}
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-400 capitalize">
              {scenario.scenario_type.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Feedback: {scenario.title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Completed on {new Date(progress.completed_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Score summary card */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Score</p>
            <p className={`mt-2 text-3xl font-bold ${performanceTier.color}`}>
              {percentage}%
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {progress.correct_answers}/{progress.total_questions} correct
            </p>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Points Earned</p>
            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {progress.score}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              out of {scenario.points} possible
            </p>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Performance</p>
            <p className={`mt-2 text-xl font-bold ${performanceTier.color}`}>
              {performanceTier.label}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {performanceTier.message}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8 glass rounded-2xl p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-zinc-400">Accuracy</span>
            <span className={performanceTier.color}>{percentage}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Detailed question review */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Detailed Review
            </h2>
          </div>

          <div className="space-y-6">
            {questions.map((q, index) => {
              const userAnswer = userAnswers[index] || "";
              const correctAnswer = correctAnswersData[index] || "";
              const isCorrect =
                userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase();

              return (
                <div
                  key={index}
                  className={`rounded-xl border p-5 ${
                    isCorrect
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-red-500/20 bg-red-500/5"
                  }`}
                >
                  <div className="mb-3 flex items-start gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isCorrect
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {isCorrect ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium leading-relaxed text-zinc-200">
                        {q.question || q.text || ""}
                      </p>
                    </div>
                  </div>

                  {q.options && (
                    <div className="ml-10 space-y-2">
                      {q.options.map((opt, optIndex) => {
                        const letter = String(opt).match(/^([A-Z])\)/)?.[1] || "";
                        const isUserAnswer = letter === userAnswer;
                        const isCorrectOption = letter === correctAnswer;

                        let optStyle = "border-zinc-800/30 bg-zinc-900/20 text-zinc-500";
                        if (isCorrectOption) {
                          optStyle = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
                        } else if (isUserAnswer && !isCorrect) {
                          optStyle = "border-red-500/40 bg-red-500/10 text-red-300 line-through";
                        }

                        return (
                          <div
                            key={optIndex}
                            className={`rounded-lg border px-4 py-2.5 text-sm ${optStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                                  isCorrectOption
                                    ? "border-emerald-400 bg-emerald-400 text-zinc-900"
                                    : isUserAnswer && !isCorrect
                                      ? "border-red-400 bg-red-400 text-zinc-900"
                                      : "border-zinc-600"
                                }`}
                              >
                                {letter}
                              </span>
                              {String(opt)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="ml-10 mt-3 space-y-2">
                    {isCorrect ? (
                      <p className="text-xs text-emerald-400">
                        You answered correctly with {correctAnswer}.
                      </p>
                    ) : (
                      <p className="text-xs text-red-400">
                        You answered {userAnswer}, but the correct answer is {correctAnswer}.
                      </p>
                    )}
                    {explanations[index] && (
                      <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3">
                        <div className="mb-1 flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                          </svg>
                          <span className="text-xs font-medium text-cyan-400">Explanation</span>
                        </div>
                        <p className="text-xs leading-relaxed text-zinc-400">
                          {explanations[index]}
                        </p>
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
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Review Scenario
          </Link>
          <Link
            href="/scenarios"
            className="rounded-xl border border-zinc-800 px-6 py-3 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
          >
            Browse More Scenarios
          </Link>
          <Link
            href="/feedback/submit"
            className="rounded-xl border border-violet-500/30 bg-violet-500/5 px-6 py-3 text-sm font-medium text-violet-400 transition-all hover:border-violet-500/50 hover:bg-violet-500/10"
          >
            Share Feedback
          </Link>
        </div>
      </main>
    </div>
  );
}
