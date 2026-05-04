"use client";

import { useState, useTransition } from "react";
import { deleteOrganization } from "@/lib/organizations/actions";

export default function DeleteOrgButton({
  orgId,
  orgName,
}: {
  orgId: string;
  orgName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(() => deleteOrganization(orgId));
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-md border border-[#ff716c]/30 bg-[#ff716c]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#ff716c] transition-all hover:bg-[#ff716c]/20"
      >
        <span className="material-symbols-outlined text-[16px]">delete</span>
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--cd-on-surface-variant)]">
        Delete <strong className="text-[var(--cd-on-surface)]">{orgName}</strong>?
      </span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center gap-1 rounded-md bg-[#ff716c] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1d2025] transition-all hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={isPending}
        className="inline-flex items-center rounded-md border border-[var(--cd-surface-container-highest)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--cd-on-surface-variant)] hover:text-[var(--cd-on-surface)] transition-all"
      >
        Cancel
      </button>
    </div>
  );
}
