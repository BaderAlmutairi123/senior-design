"use client";

import { useState, useTransition } from "react";
import {
  createInviteCode,
  deactivateInviteCode,
} from "@/lib/organizations/actions";
import type { OrganizationInvite } from "@/types/auth";

interface Props {
  orgId: string;
  initialCodes: OrganizationInvite[];
}

export default function InviteCodeManager({ orgId, initialCodes }: Props) {
  const [codes, setCodes] = useState(initialCodes);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    setGeneratedCode(null);
    startTransition(async () => {
      const result = await createInviteCode(orgId);
      if (result.ok) {
        setGeneratedCode(result.code);
        setCodes((prev) => [
          {
            id: "new",
            organization_id: orgId,
            code: result.code,
            created_by: null,
            expires_at: null,
            max_uses: 0,
            uses: 0,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        setError(result.error);
      }
    });
  }

  function handleDeactivate(inviteId: string) {
    startTransition(async () => {
      const result = await deactivateInviteCode(inviteId, orgId);
      if (result.ok) {
        setCodes((prev) =>
          prev.map((c) =>
            c.id === inviteId ? { ...c, is_active: false } : c
          )
        );
      }
    });
  }

  const activeCodes = codes.filter((c) => c.is_active);
  const inactiveCodes = codes.filter((c) => !c.is_active);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--cd-tertiary)] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[var(--cd-surface)] transition-all hover:brightness-110 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">vpn_key</span>
          {isPending ? "Generating..." : "Generate Code"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-[#ff716c]/30 bg-[#ff716c]/10 px-4 py-2 text-sm text-[#ff716c]">
          {error}
        </div>
      )}

      {generatedCode && (
        <div className="rounded-lg border border-[#a2f31f]/30 bg-[#a2f31f]/10 p-4 text-center">
          <p className="text-xs text-[var(--cd-on-surface-variant)] mb-2">
            Share this code with your team members:
          </p>
          <p className="font-mono text-3xl font-bold tracking-[0.3em] text-[#a2f31f]">
            {generatedCode}
          </p>
        </div>
      )}

      {activeCodes.length === 0 && !generatedCode ? (
        <div className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-6 text-center">
          <p className="text-sm text-[var(--cd-on-surface-variant)]">
            No active invite codes. Generate one above.
          </p>
        </div>
      ) : (
        <ul className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] divide-y divide-[var(--cd-surface-container-highest)]/50 overflow-hidden">
          {activeCodes.map((code) => (
            <li key={code.id} className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#a2f31f]/10">
                <span className="material-symbols-outlined text-[#a2f31f] text-lg">
                  vpn_key
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-bold text-[var(--cd-on-surface)] tracking-widest">
                  {code.code}
                </p>
                <p className="text-[10px] font-mono text-[var(--cd-on-surface-variant)]">
                  {code.uses} use{code.uses === 1 ? "" : "s"}
                  {code.max_uses > 0 ? ` / ${code.max_uses} max` : " (unlimited)"}
                  {code.expires_at &&
                    ` · Expires ${new Date(code.expires_at).toLocaleDateString()}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDeactivate(code.id)}
                disabled={isPending || code.id === "new"}
                className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--cd-on-surface-variant)] hover:bg-[#ff716c]/10 hover:text-[#ff716c] transition-colors disabled:opacity-50"
                title="Deactivate"
              >
                <span className="material-symbols-outlined text-[18px]">
                  block
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {inactiveCodes.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] hover:text-[var(--cd-on-surface)]">
            {inactiveCodes.length} deactivated code{inactiveCodes.length === 1 ? "" : "s"}
          </summary>
          <ul className="mt-2 rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] divide-y divide-[var(--cd-surface-container-highest)]/50 overflow-hidden opacity-60">
            {inactiveCodes.map((code) => (
              <li key={code.id} className="flex items-center gap-3 p-3">
                <span className="font-mono text-sm text-[var(--cd-on-surface-variant)] line-through tracking-widest">
                  {code.code}
                </span>
                <span className="text-[10px] font-mono text-[var(--cd-on-surface-variant)]">
                  {code.uses} use{code.uses === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
