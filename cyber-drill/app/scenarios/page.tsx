import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getScenarios } from "@/lib/scenarios/queries";
import Link from "next/link";
import type { Scenario } from "@/types/scenario";

const difficultyConfig: Record<
  Scenario["difficulty"],
  { color: string; bg: string }
> = {
  beginner: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  intermediate: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  advanced: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

const typeIcons: Record<string, JSX.Element> = {
  phishing_email: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  vishing: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  ),
  smishing: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  ),
  pretexting: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  baiting: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  ),
};

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
}

export default async function ScenariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const scenarios = await getScenarios();

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
        {/* Page header */}
        <div className="mb-10">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-cyan-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            Scenarios
          </h1>
          <p className="mt-2 text-zinc-500">
            Choose a cybersecurity training scenario to begin your drill.
          </p>
        </div>

        {scenarios.length === 0 ? (
          <div className="glass flex flex-col items-center rounded-2xl py-20 text-center">
            <svg className="mb-4 h-12 w-12 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-zinc-500">No scenarios available yet.</p>
            <p className="mt-1 text-sm text-zinc-600">Check back later for new training drills.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => {
              const diff = difficultyConfig[scenario.difficulty];
              const icon = typeIcons[scenario.scenario_type] || typeIcons.phishing_email;

              return (
                <Link
                  key={scenario.id}
                  href={`/scenarios/${scenario.id}`}
                  className="card-glow group rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6 transition-all hover:bg-zinc-900/50"
                >
                  {/* Top row: type icon + difficulty badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/50 text-zinc-400 ring-1 ring-zinc-700/50 transition-all group-hover:text-cyan-400 group-hover:ring-cyan-500/20">
                      {icon}
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${diff.bg} ${diff.color}`}>
                      {scenario.difficulty}
                    </span>
                  </div>

                  {/* Title & description */}
                  <h2 className="font-semibold text-zinc-200 transition-colors group-hover:text-cyan-400">
                    {scenario.title}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
                    {scenario.description}
                  </p>

                  {/* Bottom stats */}
                  <div className="mt-4 flex items-center gap-4 border-t border-zinc-800/50 pt-4 text-xs text-zinc-600">
                    <div className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                      </svg>
                      <span>{scenario.points} pts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span>{formatTime(scenario.time_limit_seconds)}</span>
                    </div>
                    <span className="ml-auto rounded-full bg-zinc-800/50 px-2 py-0.5 text-zinc-500 capitalize">
                      {scenario.scenario_type.replace(/_/g, " ")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
