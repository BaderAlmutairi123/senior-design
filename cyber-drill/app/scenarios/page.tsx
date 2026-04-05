import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getScenarios, getAllUserProgress } from "@/lib/scenarios/queries";
import Link from "next/link";
import type { Scenario } from "@/types/scenario";
import AppShell from "@/components/layout/AppShell";

/* ── colour / icon maps ─────────────────────────────────────────────── */

const difficultyBorder: Record<Scenario["difficulty"], string> = {
  beginner: "border-l-[#a2f31f]",
  intermediate: "border-l-[#8ff5ff]",
  advanced: "border-l-[#d873ff]",
};

const difficultyBadge: Record<
  Scenario["difficulty"],
  { text: string; bg: string }
> = {
  beginner: { text: "text-[#a2f31f]", bg: "bg-[#a2f31f]/10" },
  intermediate: { text: "text-[#8ff5ff]", bg: "bg-[#8ff5ff]/10" },
  advanced: { text: "text-[#d873ff]", bg: "bg-[#d873ff]/10" },
};

const typeIcon: Record<string, string> = {
  phishing_email: "mail",
  vishing: "call",
  smishing: "sms",
  pretexting: "person",
  baiting: "usb",
};

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
}

/* ── page ────────────────────────────────────────────────────────────── */

export default async function ScenariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [scenarios, progress] = await Promise.all([
    getScenarios(),
    getAllUserProgress(user.id),
  ]);

  // Build a lookup: scenario_id -> UserProgress
  const progressMap = new Map(progress.map((p) => [p.scenario_id, p]));

  const filterButtons = ["All", "Beginner", "Intermediate", "Advanced"];

  return (
    <AppShell email={user.email ?? ""} activePath="/scenarios">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-[#f6f6fc]">
            DRILL_SCENARIOS
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#aaabb0]">
            AVAILABLE_MISSIONS: {scenarios.length} // STATUS: ONLINE
          </p>
        </div>

        {/* Filter buttons (non-functional placeholders) */}
        <div className="flex gap-2">
          {filterButtons.map((label, i) => (
            <button
              key={label}
              className={`rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                i === 0
                  ? "border-[#8ff5ff]/40 bg-[#8ff5ff]/10 text-[#8ff5ff]"
                  : "border-[#23262c] bg-[#111318] text-[#aaabb0] hover:border-[#8ff5ff]/30 hover:text-[#f6f6fc]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid / empty state ───────────────────────────────────── */}
      {scenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#23262c] bg-[#111318] py-24 text-center">
          <span className="material-symbols-outlined mb-4 text-5xl text-[#aaabb0]">
            folder_off
          </span>
          <p className="font-headline text-lg font-bold text-[#f6f6fc]">
            NO SCENARIOS FOUND
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#aaabb0]">
            Check back later for new training drills
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => {
            const icon = typeIcon[scenario.scenario_type] ?? "mail";
            const completed = progressMap.get(scenario.id);

            return (
              <Link
                key={scenario.id}
                href={`/scenarios/${scenario.id}`}
                className={`group relative flex flex-col rounded-lg border border-[#23262c] border-l-4 bg-[#111318] p-5 transition-all duration-200 hover:border-[#8ff5ff]/40 hover:shadow-[0_0_24px_-6px_rgba(143,245,255,0.12)] ${difficultyBorder[scenario.difficulty]}`}
              >
                {/* Completed overlay badge */}
                {completed && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-[#a2f31f]/15 px-2 py-0.5">
                    <span className="material-symbols-outlined text-sm text-[#a2f31f]">
                      check_circle
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#a2f31f]">
                      Completed
                    </span>
                  </div>
                )}

                {/* Top row: icon + difficulty badge */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0c0e12] text-[#aaabb0] ring-1 ring-[#23262c] transition-colors group-hover:text-[#8ff5ff] group-hover:ring-[#8ff5ff]/30">
                    <span className="material-symbols-outlined text-xl">
                      {icon}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${difficultyBadge[scenario.difficulty].bg} ${difficultyBadge[scenario.difficulty].text}`}
                  >
                    {scenario.difficulty}
                  </span>
                </div>

                {/* Title + description */}
                <h2 className="font-headline font-bold text-[#f6f6fc] transition-colors group-hover:text-[#8ff5ff]">
                  {scenario.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-[#aaabb0]">
                  {scenario.description}
                </p>

                {/* Spacer to push stats to bottom */}
                <div className="flex-1" />

                {/* Bottom stats row */}
                <div className="mt-4 flex items-center gap-4 border-t border-[#23262c] pt-4 text-[#aaabb0]">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#a2f31f]">
                      bolt
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest">
                      {scenario.points} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#8ff5ff]">
                      timer
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest">
                      {formatTime(scenario.time_limit_seconds)}
                    </span>
                  </div>
                  <span className="ml-auto rounded bg-[#0c0e12] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#aaabb0]">
                    {scenario.scenario_type.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Score line if completed */}
                {completed && (
                  <div className="mt-3 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[#a2f31f]">
                    <span className="material-symbols-outlined text-sm">
                      scoreboard
                    </span>
                    Score: {completed.score}/{completed.total_questions}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
