"use client";

import { useTransition } from "react";
import { toggleScenarioActive, deleteScenario } from "@/lib/admin/scenario-actions";

export default function ScenarioListActions({
  scenarioId,
  isActive,
}: {
  scenarioId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleScenarioActive(scenarioId, !isActive);
    });
  }

  function handleDelete() {
    if (!confirm("Delete this scenario? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteScenario(scenarioId);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--cd-on-surface-variant)] hover:bg-[var(--cd-surface-container-high)] hover:text-[var(--cd-primary)] transition-colors disabled:opacity-50"
        title={isActive ? "Deactivate" : "Activate"}
      >
        <span className="material-symbols-outlined text-[18px]">
          {isActive ? "visibility_off" : "visibility"}
        </span>
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--cd-on-surface-variant)] hover:bg-[#ff716c]/10 hover:text-[#ff716c] transition-colors disabled:opacity-50"
        title="Delete"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  );
}
