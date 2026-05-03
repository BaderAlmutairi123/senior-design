"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCampaign, addRecipientsFromOrg } from "@/lib/phishing/actions";
import { TEMPLATE_KEYS, TEMPLATE_LABELS, type TemplateKey } from "@/lib/email/templates";
import type { OrganizationMember } from "@/types/auth";

interface CampaignFormProps {
  orgId: string;
  members: OrganizationMember[];
}

export default function CampaignForm({ orgId, members }: CampaignFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  function toggleMember(userId: string) {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function toggleAll() {
    if (selectedMembers.size === members.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(members.map((m) => m.user_id)));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const templateKey = String(form.get("template_key") ?? "");

    if (selectedMembers.size === 0) {
      setError("Select at least one recipient");
      return;
    }

    startTransition(async () => {
      const result = await createCampaign(orgId, name, templateKey);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      const chosenMembers = members.filter((m) => selectedMembers.has(m.user_id));
      const addResult = await addRecipientsFromOrg(
        result.campaignId,
        orgId,
        chosenMembers.map((m) => ({ user_id: m.user_id, email: m.email }))
      );

      if (!addResult.ok) {
        setError(addResult.error ?? "Failed to add recipients");
        return;
      }

      router.push(`/org/${orgId}/phishing/${result.campaignId}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Campaign name */}
      <div>
        <label
          htmlFor="name"
          className="block text-xs font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2"
        >
          Campaign Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Q1 Phishing Awareness Test"
          className="w-full rounded-md border border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface-container-low)] px-4 py-2.5 text-sm text-[var(--cd-on-surface)] placeholder:text-[var(--cd-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--cd-primary)]/40"
        />
      </div>

      {/* Template */}
      <div>
        <label
          htmlFor="template_key"
          className="block text-xs font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2"
        >
          Phishing Template
        </label>
        <select
          id="template_key"
          name="template_key"
          required
          className="w-full rounded-md border border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface-container-low)] px-4 py-2.5 text-sm text-[var(--cd-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--cd-primary)]/40"
        >
          {TEMPLATE_KEYS.map((key) => (
            <option key={key} value={key}>
              {TEMPLATE_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {/* Recipients */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
            Recipients ({selectedMembers.size} / {members.length})
          </label>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-[var(--cd-primary)] hover:underline"
          >
            {selectedMembers.size === members.length ? "Deselect all" : "Select all"}
          </button>
        </div>
        <div className="rounded-md border border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface-container-low)] divide-y divide-[var(--cd-surface-container-highest)] max-h-64 overflow-y-auto">
          {members.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--cd-on-surface-variant)]">
              No members in this organization.
            </p>
          ) : (
            members.map((m) => (
              <label
                key={m.user_id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[var(--cd-surface-container-high)]"
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.has(m.user_id)}
                  onChange={() => toggleMember(m.user_id)}
                  className="accent-[var(--cd-primary)]"
                />
                <span className="text-sm text-[var(--cd-on-surface)]">{m.email}</span>
                <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                  {m.role}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md bg-[var(--cd-primary)] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-[var(--cd-surface)] transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
            Creating…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-base">send</span>
            Create Campaign
          </>
        )}
      </button>
    </form>
  );
}
