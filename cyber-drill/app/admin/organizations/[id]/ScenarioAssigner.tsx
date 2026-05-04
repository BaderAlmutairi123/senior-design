"use client";

import { useState, useTransition } from "react";
import {
  assignScenarioToOrg,
  unassignScenarioFromOrg,
} from "@/lib/organizations/actions";
import type { Scenario } from "@/types/scenario";

interface Props {
  orgId: string;
  scenarios: Scenario[];
  initiallyAssignedIds: string[];
}

const difficultyColor: Record<Scenario["difficulty"], string> = {
  beginner: "text-[#a2f31f] bg-[#a2f31f]/10",
  intermediate: "text-[#8ff5ff] bg-[#8ff5ff]/10",
  advanced: "text-[#d873ff] bg-[#d873ff]/10",
};

export default function ScenarioAssigner({
  orgId,
  scenarios,
  initiallyAssignedIds,
}: Props) {
  const [assigned, setAssigned] = useState(new Set(initiallyAssignedIds));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(scenarioId: string) {
    const isAssigned = assigned.has(scenarioId);
    setError(null);
    // Optimistic update
    setAssigned((prev) => {
      const next = new Set(prev);
      if (isAssigned) next.delete(scenarioId);
      else next.add(scenarioId);
      return next;
    });

    startTransition(async () => {
      const result = isAssigned
        ? await unassignScenarioFromOrg(orgId, scenarioId)
        : await assignScenarioToOrg(orgId, scenarioId);
      if (!result.ok) {
        setError(result.error);
        // Revert
        setAssigned((prev) => {
          const next = new Set(prev);
          if (isAssigned) next.add(scenarioId);
          else next.delete(scenarioId);
          return next;
        });
      }
    });
  }

  if (scenarios.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-8 text-center">
        <p className="text-sm text-[var(--cd-on-surface-variant)]">
          No scenarios available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-[#ff716c]/10 border border-[#ff716c]/30 px-4 py-2 text-sm text-[#ff716c]">
          {error}
        </div>
      )}
      <ul className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] divide-y divide-[var(--cd-surface-container-highest)]/50 overflow-hidden">
        {scenarios.map((s) => {
          const isOn = assigned.has(s.id);
          return (
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
                className={`text-[10px] font-mono uppercase tracking-widest rounded px-2 py-0.5 ${difficultyColor[s.difficulty]}`}
              >
                {s.difficulty}
              </span>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                disabled={isPending}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all disabled:opacity-50 ${
                  isOn
                    ? "bg-[var(--cd-tertiary)]/15 text-[var(--cd-tertiary)] border border-[var(--cd-tertiary)]/40 hover:bg-[var(--cd-tertiary)]/25"
                    : "border border-[var(--cd-surface-container-highest)] text-[var(--cd-on-surface-variant)] hover:border-[var(--cd-tertiary)]/40 hover:text-[var(--cd-tertiary)]"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {isOn ? "check_circle" : "add_circle"}
                </span>
                {isOn ? "Assigned" : "Assign"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
