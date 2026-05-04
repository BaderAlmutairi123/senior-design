"use client";

import { useState, useTransition } from "react";
import { deleteOrgScenario } from "@/lib/organizations/org-scenario-actions";

interface OrgScenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  scenario_type: string;
  points: number;
  is_active: boolean;
}

const difficultyColor: Record<string, string> = {
  beginner: "text-[#a2f31f] bg-[#a2f31f]/10",
  intermediate: "text-[#8ff5ff] bg-[#8ff5ff]/10",
  advanced: "text-[#d873ff] bg-[#d873ff]/10",
};

export default function OrgScenarioList({
  orgId,
  scenarios: initialScenarios,
}: {
  orgId: string;
  scenarios: OrgScenario[];
}) {
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [isPending, startTransition] = useTransition();

  function handleDelete(scenarioId: string) {
    if (!confirm("Delete this scenario? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteOrgScenario(orgId, scenarioId);
      if (result.ok) {
        setScenarios((prev) => prev.filter((s) => s.id !== scenarioId));
      }
    });
  }

  if (scenarios.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-8 text-center">
        <span className="material-symbols-outlined mb-2 text-3xl text-[var(--cd-on-surface-variant)]">
          edit_note
        </span>
        <p className="text-sm text-[var(--cd-on-surface-variant)]">
          No custom scenarios yet. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <ul className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] divide-y divide-[var(--cd-surface-container-highest)]/50 overflow-hidden">
      {scenarios.map((s) => (
        <li key={s.id} className="flex items-center gap-3 p-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--cd-on-surface)] truncate">
              {s.title}
            </p>
            <p className="text-xs text-[var(--cd-on-surface-variant)] line-clamp-1">
              {s.description}
            </p>
          </div>
          <span
            className={`text-[10px] font-mono uppercase tracking-widest rounded px-2 py-0.5 ${
              difficultyColor[s.difficulty] ?? "text-[var(--cd-on-surface-variant)]"
            }`}
          >
            {s.difficulty}
          </span>
          <span className="text-[10px] font-mono text-[var(--cd-on-surface-variant)]">
            {s.points} pts
          </span>
          <button
            type="button"
            onClick={() => handleDelete(s.id)}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--cd-on-surface-variant)] hover:bg-[#ff716c]/10 hover:text-[#ff716c] transition-colors disabled:opacity-50"
            title="Delete scenario"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
