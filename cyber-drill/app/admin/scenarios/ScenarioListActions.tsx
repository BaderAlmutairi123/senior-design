"use client";

import { useState, useTransition } from "react";
import { toggleScenarioActive, deleteScenario } from "@/lib/admin/scenario-actions";

export default function ScenarioListActions({
  scenarioId,
  isActive,
}: {
  scenarioId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleScenarioActive(scenarioId, !isActive);
      if (!result.ok) setError(result.error ?? "Failed to update");
    });
  }

  function handleDelete() {
    if (!confirm("Delete this scenario? This cannot be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteScenario(scenarioId);
      if (!result.ok) setError(result.error ?? "Failed to delete");
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && (
        <p className="text-[10px] text-red-400 max-w-[160px] text-right">{error}</p>
      )}
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
    </div>
  );
}
