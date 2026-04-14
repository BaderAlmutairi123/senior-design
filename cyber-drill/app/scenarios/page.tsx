import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getScenarios, getAllUserProgress } from "@/lib/scenarios/queries";
import { isAdmin } from "@/lib/auth/roles";
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

  const [scenarios, progress, userIsAdmin] = await Promise.all([
    getScenarios(),
    getAllUserProgress(user.id),
    isAdmin(user.id),
  ]);

  // Build a lookup: scenario_id -> UserProgress
  const progressMap = new Map(progress.map((p) => [p.scenario_id, p]));

  const filterButtons = ["All", "Beginner", "Intermediate", "Advanced"];

  return (
    <AppShell email={user.email ?? ""} activePath="/scenarios" isAdmin={userIsAdmin}>
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-[var(--cd-on-surface)]">
            Drill Scenarios
          </h1>
          <p className="mt-1 text-sm text-[var(--cd-on-surface-variant)]">
            {scenarios.length} scenarios available
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
                  : "border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface-container-low)] text-[var(--cd-on-surface-variant)] hover:border-[#8ff5ff]/30 hover:text-[var(--cd-on-surface)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid / empty state ───────────────────────────────────── */}
      {scenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface-container-low)] py-24 text-center">
          <span className="material-symbols-outlined mb-4 text-5xl text-[var(--cd-on-surface-variant)]">
            folder_off
          </span>
          <p className="font-headline text-lg font-bold text-[var(--cd-on-surface)]">
            No Scenarios Found
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
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
                className={`group relative flex flex-col rounded-lg border border-[var(--cd-surface-container-highest)] border-l-4 bg-[var(--cd-surface-container-low)] p-5 transition-all duration-200 hover:border-[var(--cd-primary)]/40 hover:shadow-lg ${difficultyBorder[scenario.difficulty]}`}
              >
                {/* Top row: icon + difficulty badge */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--cd-surface)] text-[var(--cd-on-surface-variant)] ring-1 ring-[var(--cd-surface-container-highest)] transition-colors group-hover:text-[var(--cd-primary)] group-hover:ring-[var(--cd-primary)]/30">
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
                <h2 className="font-headline font-bold text-[var(--cd-on-surface)] transition-colors group-hover:text-[var(--cd-primary)]">
                  {scenario.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--cd-on-surface-variant)]">
                  {scenario.description}
                </p>

                {/* Spacer to push stats to bottom */}
                <div className="flex-1" />

                {/* Bottom stats row */}
                <div className="mt-4 flex items-center gap-4 border-t border-[var(--cd-surface-container-highest)] pt-4 text-[var(--cd-on-surface-variant)]">
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
                  <span className="ml-auto rounded bg-[var(--cd-surface)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                    {scenario.scenario_type.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Completed + Score row */}
                {completed && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded bg-[#a2f31f]/15 px-2 py-0.5">
                      <span className="material-symbols-outlined text-sm text-[#a2f31f]">
                        check_circle
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#a2f31f]">
                        Completed
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[#a2f31f]">
                      <span className="material-symbols-outlined text-sm">
                        scoreboard
                      </span>
                      Score: {completed.score}/{completed.total_questions}
                    </div>
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
