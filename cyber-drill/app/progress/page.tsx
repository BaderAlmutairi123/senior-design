import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getScenarios,
  getAllUserProgress,
  getUserStats,
} from "@/lib/scenarios/queries";
import Link from "next/link";
import type { Scenario, UserProgress } from "@/types/scenario";

const difficultyConfig = {
  beginner: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    bar: "from-emerald-500 to-emerald-400",
  },
  intermediate: {
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    bar: "from-amber-500 to-amber-400",
  },
  advanced: {
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    bar: "from-red-500 to-red-400",
  },
} as const;

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [scenarios, progressList, stats] = await Promise.all([
    getScenarios(),
    getAllUserProgress(user.id),
    getUserStats(user.id),
  ]);

  const progressMap = new Map<string, UserProgress>();
  for (const p of progressList) {
    progressMap.set(p.scenario_id, p);
  }

  // Calculate stats by difficulty
  const difficultyStats: Record<
    string,
    { total: number; completed: number; points: number; maxPoints: number }
  > = { beginner: { total: 0, completed: 0, points: 0, maxPoints: 0 }, intermediate: { total: 0, completed: 0, points: 0, maxPoints: 0 }, advanced: { total: 0, completed: 0, points: 0, maxPoints: 0 } };

  for (const s of scenarios) {
    const ds = difficultyStats[s.difficulty];
    if (ds) {
      ds.total++;
      ds.maxPoints += s.points;
      const prog = progressMap.get(s.id);
      if (prog) {
        ds.completed++;
        ds.points += prog.score;
      }
    }
  }

  const totalMaxPoints = scenarios.reduce((sum, s) => sum + s.points, 0);
  const overallPercent =
    stats.totalScenarios > 0
      ? Math.round((stats.completed / stats.totalScenarios) * 100)
      : 0;

  // Separate completed and not-started scenarios
  const completedScenarios: (Scenario & { progress: UserProgress })[] = [];
  const pendingScenarios: Scenario[] = [];

  for (const s of scenarios) {
    const prog = progressMap.get(s.id);
    if (prog) {
      completedScenarios.push({ ...s, progress: prog });
    } else {
      pendingScenarios.push(s);
    }
  }

  // Sort completed by most recent
  completedScenarios.sort(
    (a, b) =>
      new Date(b.progress.completed_at).getTime() -
      new Date(a.progress.completed_at).getTime()
  );

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
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-cyan-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            Progress Dashboard
          </h1>
          <p className="mt-2 text-zinc-500">
            Track your cybersecurity training progress and performance.
          </p>
        </div>

        {/* Overall stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total Scenarios</p>
            <p className="mt-1 text-2xl font-bold text-cyan-400">{stats.totalScenarios}</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Completed</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.completed}</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Points Earned</p>
            <p className="mt-1 text-2xl font-bold text-violet-400">{stats.totalPoints}</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Max Points</p>
            <p className="mt-1 text-2xl font-bold text-zinc-300">{totalMaxPoints}</p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mb-8 glass rounded-2xl p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-zinc-400">Overall Completion</span>
            <span className="text-cyan-400">{overallPercent}%</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            {stats.completed} of {stats.totalScenarios} scenarios completed
          </p>
        </div>

        {/* Progress by difficulty */}
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Progress by Difficulty
        </h2>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {(["beginner", "intermediate", "advanced"] as const).map((diff) => {
            const ds = difficultyStats[diff];
            const config = difficultyConfig[diff];
            const pct = ds.total > 0 ? Math.round((ds.completed / ds.total) * 100) : 0;

            return (
              <div key={diff} className="glass rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${config.bg} ${config.color}`}>
                    {diff}
                  </span>
                  <span className={`text-sm font-bold ${config.color}`}>{pct}%</span>
                </div>
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${config.bar} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{ds.completed}/{ds.total} completed</span>
                  <span>{ds.points}/{ds.maxPoints} pts</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completed scenarios */}
        {completedScenarios.length > 0 && (
          <>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
              Completed Scenarios
            </h2>
            <div className="mb-8 space-y-3">
              {completedScenarios.map((s) => {
                const pct = s.progress.total_questions > 0
                  ? Math.round((s.progress.correct_answers / s.progress.total_questions) * 100)
                  : 0;
                const diff = difficultyConfig[s.difficulty];

                return (
                  <Link
                    key={s.id}
                    href={`/feedback/${s.id}`}
                    className="flex items-center gap-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all hover:bg-zinc-900/50 hover:border-zinc-700/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                      <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-200 truncate">{s.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                        <span className={`capitalize ${diff.color}`}>{s.difficulty}</span>
                        <span>Score: {pct}%</span>
                        <span>{s.progress.score}/{s.points} pts</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-emerald-400">{s.progress.correct_answers}/{s.progress.total_questions}</p>
                      <p className="text-xs text-zinc-600">
                        {new Date(s.progress.completed_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Pending scenarios */}
        {pendingScenarios.length > 0 && (
          <>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
              Not Yet Attempted
            </h2>
            <div className="mb-8 space-y-3">
              {pendingScenarios.map((s) => {
                const diff = difficultyConfig[s.difficulty];

                return (
                  <Link
                    key={s.id}
                    href={`/scenarios/${s.id}`}
                    className="flex items-center gap-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all hover:bg-zinc-900/50 hover:border-zinc-700/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/50">
                      <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-200 truncate">{s.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                        <span className={`capitalize ${diff.color}`}>{s.difficulty}</span>
                        <span>{s.points} pts available</span>
                      </div>
                    </div>
                    <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-500">
                      Start
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/scenarios"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Browse Scenarios
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
