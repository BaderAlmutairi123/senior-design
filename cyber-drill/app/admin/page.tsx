import {
  getAdminStats,
  getRecentActivity,
  getScenarioCompletionStats,
} from "@/lib/admin/queries";

const difficultyColor: Record<string, string> = {
  beginner: "text-[#a2f31f]",
  intermediate: "text-[#8ff5ff]",
  advanced: "text-[#d873ff]",
};

const difficultyBg: Record<string, string> = {
  beginner: "bg-[#a2f31f]/10",
  intermediate: "bg-[#8ff5ff]/10",
  advanced: "bg-[#d873ff]/10",
};

export default async function AdminDashboard() {
  const [stats, activity, scenarioStats] = await Promise.all([
    getAdminStats(),
    getRecentActivity(8),
    getScenarioCompletionStats(),
  ]);

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: "group",
      color: "#8ff5ff",
    },
    {
      label: "Active Scenarios",
      value: stats.totalScenarios,
      icon: "precision_manufacturing",
      color: "#a2f31f",
    },
    {
      label: "Total Completions",
      value: stats.totalCompletions,
      icon: "task_alt",
      color: "#d873ff",
    },
    {
      label: "Feedback Entries",
      value: stats.totalFeedback,
      icon: "rate_review",
      color: "#ff716c",
    },
  ];

  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-headline font-bold text-4xl tracking-tighter text-[var(--cd-on-surface)]">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-[var(--cd-on-surface-variant)]">
          Platform overview and management
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-[var(--cd-surface-container-low)] p-6 rounded-lg border border-[var(--cd-surface-container-highest)]/50"
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
            <p className="font-headline font-bold text-3xl text-[var(--cd-on-surface)]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-[var(--cd-surface-container-low)] rounded-lg border border-[var(--cd-surface-container-highest)]/50 p-6">
          <h2 className="font-headline font-bold text-lg text-[var(--cd-on-surface)] mb-4">
            Recent Completions
          </h2>

          {activity.length === 0 ? (
            <p className="text-sm text-[var(--cd-on-surface-variant)]">
              No completions yet.
            </p>
          ) : (
            <div className="space-y-3">
              {activity.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container)] p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--cd-primary)]/10">
                    <span className="material-symbols-outlined text-[var(--cd-primary)] text-lg">
                      person
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--cd-on-surface)] truncate">
                      {entry.scenario_title}
                    </p>
                    <p className="text-xs text-[var(--cd-on-surface-variant)]">
                      User {entry.user_email} &mdash;{" "}
                      {new Date(entry.completed_at).toLocaleString(
                        "en-US",
                        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                      )}
                    </p>
                  </div>
                  <span className="text-sm font-mono font-bold text-[var(--cd-primary)]">
                    {entry.score}/{entry.total_questions}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scenario breakdown */}
        <div className="bg-[var(--cd-surface-container-low)] rounded-lg border border-[var(--cd-surface-container-highest)]/50 p-6">
          <h2 className="font-headline font-bold text-lg text-[var(--cd-on-surface)] mb-4">
            Scenario Completions
          </h2>

          {scenarioStats.length === 0 ? (
            <p className="text-sm text-[var(--cd-on-surface-variant)]">
              No scenarios found.
            </p>
          ) : (
            <div className="space-y-2">
              {scenarioStats.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container)] px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--cd-on-surface)] truncate">
                      {s.title}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-widest rounded px-2 py-0.5 ${difficultyColor[s.difficulty] ?? "text-[var(--cd-on-surface-variant)]"} ${difficultyBg[s.difficulty] ?? ""}`}
                  >
                    {s.difficulty}
                  </span>
                  <span className="text-sm font-mono font-bold text-[var(--cd-on-surface)] w-8 text-right">
                    {s.completions}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
