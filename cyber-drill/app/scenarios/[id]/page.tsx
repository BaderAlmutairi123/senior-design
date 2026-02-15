import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getScenarioById } from "@/lib/scenarios/queries";
import Link from "next/link";

const difficultyColor = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
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

  const content = scenario.content as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            CyberDrill
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Back link */}
        <Link
          href="/scenarios"
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          &larr; Back to scenarios
        </Link>

        {/* Scenario header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColor[scenario.difficulty]}`}
            >
              {scenario.difficulty}
            </span>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              {scenario.scenario_type}
            </span>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              {formatTime(scenario.time_limit_seconds)}
            </span>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              {scenario.points} pts
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {scenario.title}
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {scenario.description}
          </p>
        </div>

        {/* Scenario content */}
        <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Scenario Details
          </h2>
          <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
            {content.instructions && (
              <div>
                <h3 className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">
                  Instructions
                </h3>
                <p className="whitespace-pre-wrap">
                  {String(content.instructions)}
                </p>
              </div>
            )}
            {content.background && (
              <div>
                <h3 className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">
                  Background
                </h3>
                <p className="whitespace-pre-wrap">
                  {String(content.background)}
                </p>
              </div>
            )}
            {content.questions && Array.isArray(content.questions) && (
              <div>
                <h3 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
                  Questions
                </h3>
                <ol className="list-decimal space-y-3 pl-5">
                  {content.questions.map(
                    (q: Record<string, unknown>, index: number) => (
                      <li key={index}>
                        <p className="font-medium">
                          {String(q.question || q.text || "")}
                        </p>
                        {q.options && Array.isArray(q.options) && (
                          <ul className="mt-1 space-y-1 pl-4">
                            {q.options.map(
                              (opt: unknown, optIndex: number) => (
                                <li
                                  key={optIndex}
                                  className="text-zinc-600 dark:text-zinc-400"
                                >
                                  {String(opt)}
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </li>
                    )
                  )}
                </ol>
              </div>
            )}
            {/* Fallback: render raw JSON if no known keys */}
            {!content.instructions &&
              !content.background &&
              !content.questions && (
                <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-zinc-100 p-4 text-xs dark:bg-zinc-900">
                  {JSON.stringify(content, null, 2)}
                </pre>
              )}
          </div>
        </section>
      </main>
    </div>
  );
}
