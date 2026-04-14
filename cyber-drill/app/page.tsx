import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getUserStats,
  getScenarios,
  getAllUserProgress,
} from "@/lib/scenarios/queries";
import { isAdmin } from "@/lib/auth/roles";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import type { Scenario, UserProgress } from "@/types/scenario";

/* ── helpers ─────────────────────────────────────────────────────────── */

function scenarioIcon(type: string): string {
  switch (type.toLowerCase()) {
    case "quiz":
      return "quiz";
    case "simulation":
      return "terminal";
    case "lab":
      return "science";
    case "ctf":
      return "flag";
    case "network":
      return "lan";
    case "forensics":
      return "fingerprint";
    default:
      return "shield";
  }
}

const difficultyColor: Record<string, string> = {
  beginner: "#a2f31f",
  intermediate: "#8ff5ff",
  advanced: "#d873ff",
};

const difficultyBg: Record<string, string> = {
  beginner: "rgba(162,243,31,0.10)",
  intermediate: "rgba(143,245,255,0.10)",
  advanced: "rgba(216,115,255,0.10)",
};

const difficultyBorder: Record<string, string> = {
  beginner: "border-l-[#a2f31f]",
  intermediate: "border-l-[#8ff5ff]",
  advanced: "border-l-[#d873ff]",
};

/* ── progress ring SVG ───────────────────────────────────────────────── */

function ProgressRing({
  percent,
  size = 180,
  strokeWidth = 10,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-[0_0_24px_rgba(143,245,255,0.15)]"
    >
      {/* track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--cd-surface-container-highest)"
        strokeWidth={strokeWidth}
      />
      {/* filled arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--cd-primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-700"
      />
      {/* center label */}
      <text
        x="50%"
        y="46%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-[var(--cd-on-surface)] font-headline text-3xl font-bold"
        style={{ fontSize: 32 }}
      >
        {percent}%
      </text>
      <text
        x="50%"
        y="62%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-[var(--cd-on-surface-variant)] font-mono uppercase"
        style={{ fontSize: 9, letterSpacing: "0.2em" }}
      >
        Complete
      </text>
    </svg>
  );
}

/* ── page ─────────────────────────────────────────────────────────────── */

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [stats, scenarios, progressList, userIsAdmin] = await Promise.all([
    getUserStats(user.id),
    getScenarios(),
    getAllUserProgress(user.id),
    isAdmin(user.id),
  ]);

  const { totalScenarios, completed, totalPoints } = stats;
  const completionPct =
    totalScenarios > 0 ? Math.round((completed / totalScenarios) * 100) : 0;

  // Build a set of completed scenario IDs for quick lookup
  const completedIds = new Set(progressList.map((p) => p.scenario_id));

  // Build per-difficulty progress for the profiling section
  const difficultyStats = (["beginner", "intermediate", "advanced"] as const).map(
    (level) => {
      const total = scenarios.filter((s) => s.difficulty === level).length;
      const done = scenarios.filter(
        (s) => s.difficulty === level && completedIds.has(s.id)
      ).length;
      return { level, total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
    }
  );

  return (
    <AppShell email={user.email ?? ""} activePath="/" isAdmin={userIsAdmin}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-12">
        {/* left */}
        <div className="max-w-xl">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cd-primary)] mb-3">
            Dashboard
          </p>
          <h1 className="font-headline font-bold text-4xl text-[var(--cd-on-surface)] leading-tight">
            Welcome back.
          </h1>
          <p className="mt-3 text-[var(--cd-on-surface-variant)] text-base leading-relaxed">
            You are{" "}
            <span className="text-[var(--cd-primary)] font-semibold">{completionPct}%</span>{" "}
            through your training scenarios.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/scenarios"
              className="inline-flex items-center gap-2 rounded-md bg-[#8ff5ff] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#005d63] transition-all hover:brightness-110 hover:shadow-[0_0_24px_rgba(143,245,255,0.25)]"
            >
              <span className="material-symbols-outlined text-[18px]">
                rocket_launch
              </span>
              Continue Training
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--cd-surface-container-highest)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[var(--cd-on-surface-variant)] transition-all hover:border-[var(--cd-primary)]/40 hover:text-[var(--cd-on-surface)]"
            >
              <span className="material-symbols-outlined text-[18px]">
                bar_chart
              </span>
              View Progress
            </Link>
          </div>
        </div>

        {/* right – progress ring */}
        <div className="flex-shrink-0">
          <ProgressRing percent={completionPct} size={180} strokeWidth={10} />
        </div>
      </section>

      {/* ── Stats Grid ───────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          {
            label: "Drills Completed",
            value: completed,
            icon: "task_alt",
            color: "#8ff5ff",
          },
          {
            label: "Skill Score",
            value: totalPoints,
            icon: "bolt",
            color: "#a2f31f",
          },
          {
            label: "Total Scenarios",
            value: totalScenarios,
            icon: "precision_manufacturing",
            color: "#d873ff",
          },
          {
            label: "Achievement Rate",
            value: `${completionPct}%`,
            icon: "emoji_events",
            color: "#8ff5ff",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-[var(--cd-surface-container-low)] p-6 rounded-lg border border-[var(--cd-surface-container-highest)]/50 transition-all hover:border-[var(--cd-primary)]/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ color: card.color }}
              >
                {card.icon}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cd-on-surface-variant)]">
                {card.label}
              </span>
            </div>
            <p className="font-headline font-bold text-2xl text-[var(--cd-on-surface)]">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      {/* ── Two-column: Operations + Profiling ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Operations – 2/3 width */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline font-bold text-lg text-[var(--cd-on-surface)]">
              Recent Scenarios
            </h2>
            <Link
              href="/scenarios"
              className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cd-primary)] hover:text-[var(--cd-primary)]/70 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {scenarios.slice(0, 6).map((scenario) => {
              const isCompleted = completedIds.has(scenario.id);
              const progress = progressList.find(
                (p) => p.scenario_id === scenario.id
              );
              const segmentCount = 4;
              const filledSegments = isCompleted
                ? segmentCount
                : progress
                  ? Math.max(
                      1,
                      Math.round(
                        (progress.correct_answers / progress.total_questions) *
                          segmentCount
                      )
                    )
                  : 0;

              return (
                <div
                  key={scenario.id}
                  className={`bg-[var(--cd-surface-container-low)] rounded-lg border border-[var(--cd-surface-container-highest)]/50 border-l-2 ${
                    difficultyBorder[scenario.difficulty] ?? "border-l-[#8ff5ff]"
                  } p-4 flex items-center gap-4 transition-all hover:border-[var(--cd-primary)]/20`}
                >
                  {/* icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--cd-surface-container)]">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{
                        color:
                          difficultyColor[scenario.difficulty] ?? "#8ff5ff",
                      }}
                    >
                      {scenarioIcon(scenario.scenario_type)}
                    </span>
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-semibold text-sm text-[var(--cd-on-surface)] truncate">
                      {scenario.title}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      {/* difficulty badge */}
                      <span
                        className="text-[10px] font-mono uppercase tracking-[0.2em] rounded px-2 py-0.5"
                        style={{
                          color:
                            difficultyColor[scenario.difficulty] ?? "#8ff5ff",
                          backgroundColor:
                            difficultyBg[scenario.difficulty] ??
                            "rgba(143,245,255,0.10)",
                        }}
                      >
                        {scenario.difficulty}
                      </span>

                      {/* segmented progress bar */}
                      <div className="flex gap-1">
                        {Array.from({ length: segmentCount }).map((_, i) => (
                          <div
                            key={i}
                            className="h-1.5 w-5 rounded-full transition-colors"
                            style={{
                              backgroundColor:
                                i < filledSegments
                                  ? difficultyColor[scenario.difficulty] ??
                                    "#8ff5ff"
                                  : "#23262c",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* action */}
                  <Link
                    href={`/scenarios/${scenario.id}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--cd-surface-container)] text-[var(--cd-on-surface-variant)] transition-all hover:bg-[var(--cd-surface-container-high)] hover:text-[var(--cd-primary)]"
                    aria-label={isCompleted ? "Replay scenario" : "Start scenario"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isCompleted ? "replay" : "play_arrow"}
                    </span>
                  </Link>
                </div>
              );
            })}

            {scenarios.length === 0 && (
              <div className="bg-[var(--cd-surface-container-low)] rounded-lg border border-[var(--cd-surface-container-highest)]/50 p-8 text-center">
                <p className="text-[var(--cd-on-surface-variant)] text-sm">
                  No scenarios available yet.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Operator Profiling – 1/3 width */}
        <section>
          <h2 className="font-headline font-bold text-lg text-[var(--cd-on-surface)] mb-5">
            Skill Breakdown
          </h2>

          <div className="bg-[var(--cd-surface-container-low)] rounded-lg border border-[var(--cd-surface-container-highest)]/50 p-6 flex flex-col gap-6">
            {difficultyStats.map(({ level, total, done, pct }) => (
              <div key={level}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cd-on-surface-variant)]">
                    {level}
                  </span>
                  <span
                    className="text-xs font-mono font-semibold"
                    style={{ color: difficultyColor[level] }}
                  >
                    {done}/{total}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--cd-surface-container-high)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: difficultyColor[level],
                    }}
                  />
                </div>
              </div>
            ))}

            {/* overall summary */}
            <div className="pt-4 border-t border-[var(--cd-surface-container-highest)]/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cd-on-surface-variant)]">
                  Overall Progress
                </span>
                <span className="text-sm font-headline font-bold text-[var(--cd-primary)]">
                  {completionPct}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-[var(--cd-surface-container-high)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--cd-primary)] transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
