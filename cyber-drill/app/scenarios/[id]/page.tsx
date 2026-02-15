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
              {scenario.category}
            </span>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              {scenario.estimated_duration} min
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {scenario.title}
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {scenario.description}
          </p>
        </div>

        {/* Objectives */}
        {scenario.objectives && scenario.objectives.length > 0 && (
          <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Learning Objectives
            </h2>
            <ul className="space-y-2">
              {scenario.objectives.map((objective, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span className="mt-0.5 text-zinc-400 dark:text-zinc-500">
                    {index + 1}.
                  </span>
                  {objective}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Scenario content */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Scenario Details
          </h2>
          <div className="prose prose-zinc max-w-none text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap dark:text-zinc-300">
            {scenario.content}
          </div>
        </section>
      </main>
    </div>
  );
}
