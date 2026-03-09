import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getScenarioById, getUserProgress } from "@/lib/scenarios/queries";
import Link from "next/link";
import QuizClient from "./QuizClient";
import type { QuizQuestion } from "@/types/scenario";

const difficultyConfig = {
  beginner: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  intermediate: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  advanced: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
} as const;

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
}

export default async function ScenarioViewerPage({
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

  const content = scenario.content as {
    instructions?: string;
    background?: string;
    questions?: QuizQuestion[];
  };
  const diff = difficultyConfig[scenario.difficulty];
  const questions = (content.questions as QuizQuestion[]) || [];
  const correctAnswersData = (
    scenario.correct_answers as { answers: string[] }
  )?.answers || [];

  // Fetch existing progress for this user + scenario
  const existingProgress = await getUserProgress(user.id, scenario.id);

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

        {/* Scenario header card */}
        <div className="glass mb-8 rounded-2xl p-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${diff.bg} ${diff.color}`}>
              {scenario.difficulty}
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-400 capitalize">
              {scenario.scenario_type}
            </span>
            <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {formatTime(scenario.time_limit_seconds)}
            </div>
            <div className="flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              {scenario.points} pts
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            {scenario.title}
          </h1>
          <p className="mt-3 leading-relaxed text-zinc-400">
            {scenario.description}
          </p>
        </div>

        {/* Scenario content sections */}
        <div className="space-y-6">
          {content.instructions && (
            <section className="glass rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                  <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Instructions
                </h2>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-zinc-300">
                {content.instructions}
              </p>
            </section>
          )}

          {content.background && (
            <section className="glass rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                  <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Background
                </h2>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-zinc-300">
                {content.background}
              </p>
            </section>
          )}

          {/* Interactive Quiz */}
          {questions.length > 0 && (
            <QuizClient
              scenarioId={scenario.id}
              questions={questions}
              maxPoints={scenario.points}
              existingProgress={existingProgress}
              correctAnswersData={correctAnswersData}
            />
          )}

          {/* Fallback: render raw JSON if no known keys */}
          {!content.instructions &&
            !content.background &&
            !content.questions && (
              <section className="glass rounded-2xl p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Scenario Data
                </h2>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-zinc-900/50 p-4 font-mono text-xs text-zinc-400">
                  {JSON.stringify(content, null, 2)}
                </pre>
              </section>
            )}
        </div>
      </main>
    </div>
  );
}
