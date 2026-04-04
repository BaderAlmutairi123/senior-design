import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserStats } from "@/lib/scenarios/queries";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { totalScenarios, completed, totalPoints } = await getUserStats(user.id);

  const cards = [
    {
      href: "/scenarios",
      icon: (
        <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      title: "Scenarios",
      desc: "Browse and start cybersecurity training drills.",
      stat: `${totalScenarios} available`,
    },
    {
      href: "/feedback/submit",
      icon: (
        <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      ),
      title: "Feedback",
      desc: "Share your experience and help us improve.",
      stat: "New",
    },
    {
      href: "/progress",
      icon: (
        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      ),
      title: "Progress",
      desc: "Track your training progress and performance.",
      stat: `${stats.completed} done`,
    },
  ];

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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <span className="gradient-text text-lg font-bold tracking-tight">CyberDrill</span>
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
        {/* Welcome section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-500">
            Welcome back, <span className="text-zinc-300">{user.email}</span>
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-10 grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Scenarios</p>
            <p className="mt-1 text-2xl font-bold text-cyan-400">{totalScenarios}</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Completed</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{completed}</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total Points</p>
            <p className="mt-1 text-2xl font-bold text-violet-400">{totalPoints}</p>
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="card-glow group rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6 transition-all hover:bg-zinc-900/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800/50 ring-1 ring-zinc-700/50 transition-all group-hover:ring-cyan-500/20">
                  {card.icon}
                </div>
                <span className="rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs text-zinc-500">
                  {card.stat}
                </span>
              </div>
              <h3 className="font-semibold text-zinc-200 group-hover:text-cyan-400 transition-colors">
                {card.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {card.desc}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
