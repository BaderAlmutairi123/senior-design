import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Scenario } from "@/types/scenario";
import ScenarioListActions from "./ScenarioListActions";

const difficultyColor: Record<string, string> = {
  beginner: "text-[#a2f31f] bg-[#a2f31f]/10",
  intermediate: "text-[#8ff5ff] bg-[#8ff5ff]/10",
  advanced: "text-[#d873ff] bg-[#d873ff]/10",
};

export default async function AdminScenariosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("scenarios")
    .select("*")
    .order("created_at", { ascending: false });

  const scenarios = (data ?? []) as Scenario[];

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline font-bold text-4xl tracking-tighter text-[var(--cd-on-surface)]">
            Scenarios
          </h1>
          <p className="mt-2 text-sm text-[var(--cd-on-surface-variant)]">
            {scenarios.length} total scenario{scenarios.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/scenarios/new"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--cd-tertiary)] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-[var(--cd-surface)] transition-all hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Scenario
        </Link>
      </div>

      {scenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] py-20 text-center">
          <span className="material-symbols-outlined mb-4 text-5xl text-[var(--cd-on-surface-variant)]">
            precision_manufacturing
          </span>
          <p className="font-headline text-lg font-bold text-[var(--cd-on-surface)]">
            No Scenarios Yet
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
            Create one to get started
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] overflow-hidden">
          <ul className="divide-y divide-[var(--cd-surface-container-highest)]/50">
            {scenarios.map((s) => (
              <li key={s.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--cd-on-surface)] truncate">
                    {s.title}
                  </p>
                  <p className="text-xs text-[var(--cd-on-surface-variant)] line-clamp-1">
                    {s.description}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${difficultyColor[s.difficulty] ?? ""}`}
                >
                  {s.difficulty}
                </span>
                <span className="font-mono text-xs text-[var(--cd-on-surface-variant)]">
                  {s.points} pts
                </span>
                <span
                  className={`text-[10px] font-mono uppercase tracking-widest ${
                    s.is_active
                      ? "text-[#a2f31f]"
                      : "text-[var(--cd-on-surface-variant)]"
                  }`}
                >
                  {s.is_active ? "Active" : "Inactive"}
                </span>
                <ScenarioListActions scenarioId={s.id} isActive={s.is_active} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
