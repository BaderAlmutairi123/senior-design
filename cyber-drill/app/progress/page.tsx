import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getScenarios,
  getAllUserProgress,
  getUserStats,
} from "@/lib/scenarios/queries";
import { isAdmin } from "@/lib/auth/roles";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import type { Scenario, UserProgress } from "@/types/scenario";

const difficultyConfig = {
  beginner: {
    label: "Beginner",
    color: "#a2f31f",
    textClass: "text-[#a2f31f]",
    bgClass: "bg-[#a2f31f]/10",
    borderClass: "border-[#a2f31f]/30",
    icon: "shield",
  },
  intermediate: {
    label: "Intermediate",
    color: "#8ff5ff",
    textClass: "text-[#8ff5ff]",
    bgClass: "bg-[#8ff5ff]/10",
    borderClass: "border-[#8ff5ff]/30",
    icon: "security",
  },
  advanced: {
    label: "Advanced",
    color: "#d873ff",
    textClass: "text-[#d873ff]",
    bgClass: "bg-[#d873ff]/10",
    borderClass: "border-[#d873ff]/30",
    icon: "verified_user",
  },
} as const;

const badgeDefinitions = [
  { key: "first_blood", label: "First Blood", icon: "local_fire_department", colorClass: "bg-[#a2f31f]/10 text-[#a2f31f]" },
  { key: "phishing_expert", label: "Phishing Expert", icon: "mail_lock", colorClass: "bg-[#8ff5ff]/10 text-[#8ff5ff]" },
  { key: "vishing_pro", label: "Vishing Pro", icon: "phone_locked", colorClass: "bg-[#d873ff]/10 text-[#d873ff]" },
  { key: "smishing_ace", label: "Smishing Ace", icon: "sms", colorClass: "bg-[#a2f31f]/10 text-[#a2f31f]" },
  { key: "perfect_score", label: "Perfect Score", icon: "star", colorClass: "bg-[#8ff5ff]/10 text-[#8ff5ff]" },
  { key: "beginner_clear", label: "Beginner Clear", icon: "shield", colorClass: "bg-[#a2f31f]/10 text-[#a2f31f]" },
  { key: "intermediate_clear", label: "Intermediate Clear", icon: "security", colorClass: "bg-[#8ff5ff]/10 text-[#8ff5ff]" },
  { key: "advanced_clear", label: "Advanced Clear", icon: "verified_user", colorClass: "bg-[#d873ff]/10 text-[#d873ff]" },
  { key: "speed_demon", label: "Speed Demon", icon: "bolt", colorClass: "bg-[#ff716c]/10 text-[#ff716c]" },
  { key: "half_way", label: "Half Way", icon: "flag", colorClass: "bg-[#8ff5ff]/10 text-[#8ff5ff]" },
  { key: "completionist", label: "Completionist", icon: "military_tech", colorClass: "bg-[#a2f31f]/10 text-[#a2f31f]" },
  { key: "resilient", label: "Resilient", icon: "psychology", colorClass: "bg-[#d873ff]/10 text-[#d873ff]" },
];

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [scenarios, progressList, stats, userIsAdmin] = await Promise.all([
    getScenarios(),
    getAllUserProgress(user.id),
    getUserStats(user.id),
    isAdmin(user.id),
  ]);

  const progressMap = new Map<string, UserProgress>();
  for (const p of progressList) {
    progressMap.set(p.scenario_id, p);
  }

  // Calculate stats by difficulty
  const difficultyStats: Record<
    string,
    { total: number; completed: number; points: number; maxPoints: number }
  > = {
    beginner: { total: 0, completed: 0, points: 0, maxPoints: 0 },
    intermediate: { total: 0, completed: 0, points: 0, maxPoints: 0 },
    advanced: { total: 0, completed: 0, points: 0, maxPoints: 0 },
  };

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

  // Calculate accuracy
  const totalCorrect = completedScenarios.reduce((sum, s) => sum + s.progress.correct_answers, 0);
  const totalQuestions = completedScenarios.reduce((sum, s) => sum + s.progress.total_questions, 0);
  const accuracyPercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Determine earned badges
  const earnedBadges = new Set<string>();
  if (completedScenarios.length > 0) earnedBadges.add("first_blood");
  if (completedScenarios.some((s) => s.scenario_type === "phishing_email")) earnedBadges.add("phishing_expert");
  if (completedScenarios.some((s) => s.scenario_type === "vishing")) earnedBadges.add("vishing_pro");
  if (completedScenarios.some((s) => s.scenario_type === "smishing")) earnedBadges.add("smishing_ace");
  if (completedScenarios.some((s) => s.progress.correct_answers === s.progress.total_questions && s.progress.total_questions > 0)) earnedBadges.add("perfect_score");
  if (difficultyStats.beginner.total > 0 && difficultyStats.beginner.completed === difficultyStats.beginner.total) earnedBadges.add("beginner_clear");
  if (difficultyStats.intermediate.total > 0 && difficultyStats.intermediate.completed === difficultyStats.intermediate.total) earnedBadges.add("intermediate_clear");
  if (difficultyStats.advanced.total > 0 && difficultyStats.advanced.completed === difficultyStats.advanced.total) earnedBadges.add("advanced_clear");
  if (overallPercent >= 50) earnedBadges.add("half_way");
  if (overallPercent === 100) earnedBadges.add("completionist");
  if (accuracyPercent >= 80 && completedScenarios.length >= 3) earnedBadges.add("resilient");
  if (completedScenarios.length >= 2) earnedBadges.add("speed_demon");

  // SVG trajectory points (decorative, based on completed scenario scores)
  const trajectoryPoints = completedScenarios
    .slice()
    .reverse()
    .slice(0, 8)
    .map((s, i, arr) => {
      const pct = s.progress.total_questions > 0 ? s.progress.correct_answers / s.progress.total_questions : 0;
      const x = arr.length > 1 ? (i / (arr.length - 1)) * 340 + 20 : 180;
      const y = 100 - pct * 80;
      return `${x},${y}`;
    });
  const trajectoryPath = trajectoryPoints.length > 1 ? `M${trajectoryPoints.join(" L")}` : "";

  return (
    <AppShell email={user.email ?? ""} activePath="/progress" isAdmin={userIsAdmin}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-headline font-bold text-4xl tracking-tighter text-[var(--cd-on-surface)]">
          Your Progress
        </h1>
        <p className="mt-2 text-sm text-[var(--cd-on-surface-variant)]">
          {user.email} &mdash; {overallPercent}% complete
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4">

        {/* ===== Skill Progress Panel (col-span-8) ===== */}
        <div className="col-span-12 lg:col-span-8 bg-[#111318] rounded-sm border border-[#23262c] p-6">
          {/* Panel Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-semibold text-lg text-[var(--cd-on-surface)]">
              Personal Skill Tree
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#a2f31f]" />
              <div className="h-2 w-2 rounded-full bg-[#8ff5ff]" />
              <div className="h-2 w-2 rounded-full bg-[#d873ff]" />
            </div>
          </div>

          {/* Difficulty Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(["beginner", "intermediate", "advanced"] as const).map((diff) => {
              const ds = difficultyStats[diff];
              const config = difficultyConfig[diff];
              const pct = ds.total > 0 ? Math.round((ds.completed / ds.total) * 100) : 0;
              const isActive = ds.completed > 0;

              return (
                <div
                  key={diff}
                  className={`relative flex flex-col items-center rounded-sm border p-5 transition-all ${
                    isActive
                      ? `${config.borderClass} bg-[#171a1f]`
                      : "border-[#23262c] bg-[#111318] opacity-60"
                  }`}
                  style={isActive ? { boxShadow: `0 0 24px ${config.color}15` } : undefined}
                >
                  {/* Hex Icon Node */}
                  <div
                    className={`hex-clip flex h-16 w-16 items-center justify-center mb-3 ${
                      isActive ? config.bgClass : "bg-[#1d2025]"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        isActive ? config.textClass : "text-[var(--cd-outline)]"
                      }`}
                      style={isActive ? { filter: `drop-shadow(0 0 6px ${config.color}66)` } : undefined}
                    >
                      {config.icon}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${config.textClass}`}>
                    {config.label}
                  </span>

                  {/* Progress Ring / Bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#23262c] mb-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: config.color }}
                    />
                  </div>

                  <p className="text-xs text-[var(--cd-on-surface-variant)]">
                    <span className={config.textClass}>{ds.completed}</span> / {ds.total} completed
                  </p>
                  <p className="text-[10px] text-[var(--cd-outline)] mt-0.5">
                    {ds.points} / {ds.maxPoints} pts
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== Stats Sidebar (col-span-4) ===== */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Total Score */}
          <div className="bg-[#111318] rounded-sm border border-[#23262c] p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#8ff5ff]/10">
              <span className="material-symbols-outlined text-[#8ff5ff]">bolt</span>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                Total Score
              </p>
              <p className="font-headline text-2xl font-bold text-[var(--cd-on-surface)]">
                {stats.totalPoints}
              </p>
            </div>
          </div>

          {/* Scenarios Completed */}
          <div className="bg-[#111318] rounded-sm border border-[#23262c] p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#a2f31f]/10">
              <span className="material-symbols-outlined text-[#a2f31f]">check_circle</span>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                Scenarios Completed
              </p>
              <p className="font-headline text-2xl font-bold text-[var(--cd-on-surface)]">
                {stats.completed} <span className="text-sm font-normal text-[var(--cd-outline)]">/ {stats.totalScenarios}</span>
              </p>
            </div>
          </div>

          {/* Completion % */}
          <div className="bg-[#111318] rounded-sm border border-[#23262c] p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#d873ff]/10">
              <span className="material-symbols-outlined text-[#d873ff]">trending_up</span>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                Completion
              </p>
              <p className="font-headline text-2xl font-bold text-[var(--cd-on-surface)]">
                {overallPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* ===== Performance Trajectory (col-span-7) ===== */}
        <div className="col-span-12 lg:col-span-7 bg-[#111318] rounded-sm border border-[#23262c] p-6">
          <h2 className="font-headline font-semibold text-sm text-[var(--cd-on-surface)] mb-4">
            Performance Trajectory
          </h2>
          <div className="w-full h-32 relative">
            <svg viewBox="0 0 380 120" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="20" y1={20 + i * 20} x2="360" y2={20 + i * 20}
                  stroke="#23262c" strokeWidth="0.5"
                />
              ))}
              {/* Gradient fill under curve */}
              {trajectoryPath && (
                <>
                  <defs>
                    <linearGradient id="trajGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8ff5ff" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#8ff5ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${trajectoryPath} L${trajectoryPoints[trajectoryPoints.length - 1].split(",")[0]},110 L${trajectoryPoints[0].split(",")[0]},110 Z`}
                    fill="url(#trajGrad)"
                  />
                  <path
                    d={trajectoryPath}
                    fill="none"
                    stroke="#8ff5ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data dots */}
                  {trajectoryPoints.map((pt, i) => {
                    const [cx, cy] = pt.split(",");
                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="3"
                        fill="#0c0e12"
                        stroke="#8ff5ff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </>
              )}
              {!trajectoryPath && (
                <text x="190" y="65" textAnchor="middle" fill="#46484d" fontSize="11" fontFamily="monospace">
                  Complete scenarios to see your trajectory
                </text>
              )}
              {/* Axis labels */}
              <text x="20" y="115" fill="#46484d" fontSize="8" fontFamily="monospace">oldest</text>
              <text x="340" y="115" fill="#46484d" fontSize="8" fontFamily="monospace" textAnchor="end">recent</text>
            </svg>
          </div>
        </div>

        {/* ===== Badge Gallery (col-span-5) ===== */}
        <div className="col-span-12 lg:col-span-5 bg-[#111318] rounded-sm border border-[#23262c] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline font-semibold text-sm text-[var(--cd-on-surface)]">
              Badge Gallery
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
              {earnedBadges.size} / {badgeDefinitions.length} unlocked
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {badgeDefinitions.map((badge) => {
              const earned = earnedBadges.has(badge.key);
              return (
                <div
                  key={badge.key}
                  className={`flex flex-col items-center gap-1.5 rounded-sm p-2.5 transition-all ${
                    earned ? badge.colorClass : "bg-[#171a1f] text-[var(--cd-outline)] opacity-40"
                  }`}
                  title={badge.label}
                >
                  <span className="material-symbols-outlined text-xl">
                    {badge.icon}
                  </span>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-center leading-tight">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== Completed Scenarios (full width) ===== */}
        {completedScenarios.length > 0 && (
          <div className="col-span-12 bg-[#111318] rounded-sm border border-[#23262c] p-6">
            <h2 className="font-headline font-semibold text-sm text-[var(--cd-on-surface)] mb-4">
              Completed Scenarios
            </h2>
            <div className="space-y-2">
              {completedScenarios.map((s) => {
                const pct =
                  s.progress.total_questions > 0
                    ? Math.round((s.progress.correct_answers / s.progress.total_questions) * 100)
                    : 0;
                const config = difficultyConfig[s.difficulty];

                return (
                  <Link
                    key={s.id}
                    href={`/feedback/${s.id}`}
                    className="flex items-center gap-4 rounded-sm border border-[#23262c] bg-[#171a1f] px-4 py-3 transition-all hover:border-[#8ff5ff]/30 hover:bg-[#1d2025] group"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${config.bgClass}`}>
                      <span className={`material-symbols-outlined text-lg ${config.textClass}`}>
                        check_circle
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[var(--cd-on-surface)] truncate group-hover:text-[#8ff5ff] transition-colors">
                        {s.title}
                      </p>
                    </div>
                    <span
                      className={`hidden sm:inline-block rounded-sm border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${config.borderClass} ${config.textClass}`}
                    >
                      {s.difficulty}
                    </span>
                    <span className="text-sm font-mono font-bold text-[var(--cd-on-surface)]">
                      {pct}%
                    </span>
                    <span className="text-xs font-mono text-[var(--cd-outline)] w-20 text-right">
                      {s.progress.score}/{s.points} pts
                    </span>
                    <span className="text-xs font-mono text-[var(--cd-outline)] w-16 text-right hidden sm:block">
                      {new Date(s.progress.completed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== Pending Scenarios (full width) ===== */}
        {pendingScenarios.length > 0 && (
          <div className="col-span-12 bg-[#111318] rounded-sm border border-[#23262c] p-6">
            <h2 className="font-headline font-semibold text-sm text-[var(--cd-on-surface)] mb-4">
              Pending Scenarios
            </h2>
            <div className="space-y-2">
              {pendingScenarios.map((s) => {
                const config = difficultyConfig[s.difficulty];

                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 rounded-sm border border-[#23262c] bg-[#171a1f] px-4 py-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#1d2025]">
                      <span className="material-symbols-outlined text-lg text-[var(--cd-outline)]">
                        lock
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[var(--cd-on-surface-variant)] truncate">
                        {s.title}
                      </p>
                    </div>
                    <span
                      className={`hidden sm:inline-block rounded-sm border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${config.borderClass} ${config.textClass}`}
                    >
                      {s.difficulty}
                    </span>
                    <span className="text-xs font-mono text-[var(--cd-outline)] w-20 text-right">
                      {s.points} pts
                    </span>
                    <Link
                      href={`/scenarios/${s.id}`}
                      className="chamfer-sm rounded-sm border border-[#8ff5ff]/30 bg-[#8ff5ff]/5 px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#8ff5ff] transition-all hover:bg-[#8ff5ff]/15 hover:border-[#8ff5ff]/60"
                    >
                      Start
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== Bottom Stats Bar ===== */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border-l-4 border-[#8ff5ff] bg-[#111318] rounded-sm border-y border-r border-[#23262c] p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
            Total Points
          </p>
          <p className="font-headline text-xl font-bold text-[var(--cd-on-surface)] mt-1">
            {stats.totalPoints}
            <span className="text-xs font-normal text-[var(--cd-outline)] ml-1">/ {totalMaxPoints}</span>
          </p>
        </div>
        <div className="border-l-4 border-[#a2f31f] bg-[#111318] rounded-sm border-y border-r border-[#23262c] p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
            Drills Completed
          </p>
          <p className="font-headline text-xl font-bold text-[var(--cd-on-surface)] mt-1">
            {stats.completed}
            <span className="text-xs font-normal text-[var(--cd-outline)] ml-1">/ {stats.totalScenarios}</span>
          </p>
        </div>
        <div className="border-l-4 border-[#d873ff] bg-[#111318] rounded-sm border-y border-r border-[#23262c] p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
            Badges Earned
          </p>
          <p className="font-headline text-xl font-bold text-[var(--cd-on-surface)] mt-1">
            {earnedBadges.size}
            <span className="text-xs font-normal text-[var(--cd-outline)] ml-1">/ {badgeDefinitions.length}</span>
          </p>
        </div>
        <div className="border-l-4 border-[#ff716c] bg-[#111318] rounded-sm border-y border-r border-[#23262c] p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
            Accuracy
          </p>
          <p className="font-headline text-xl font-bold text-[var(--cd-on-surface)] mt-1">
            {accuracyPercent}%
          </p>
        </div>
      </div>
    </AppShell>
  );
}
