import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getScenarios } from "@/lib/scenarios/queries";
import Link from "next/link";
import FeedbackForm from "./FeedbackForm";

export default async function FeedbackSubmitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const scenarios = await getScenarios();
  const scenarioOptions = scenarios.map((s) => ({ id: s.id, title: s.title }));

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
      <main className="relative z-10 mx-auto max-w-2xl px-6 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-cyan-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
              <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                Share Your Feedback
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Help us improve CyberDrill by sharing your experience and suggestions.
              </p>
            </div>
          </div>
        </div>

        <FeedbackForm scenarios={scenarioOptions} />
      </main>
    </div>
  );
}
