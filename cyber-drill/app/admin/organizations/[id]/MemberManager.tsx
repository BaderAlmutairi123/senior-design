"use client";

import { useState, useTransition } from "react";
import {
  addMemberByEmail,
  removeMember,
  updateMemberRole,
} from "@/lib/organizations/actions";
import type { OrganizationMember } from "@/types/auth";

interface Props {
  orgId: string;
  initialMembers: OrganizationMember[];
}

const roleStyles: Record<OrganizationMember["role"], string> = {
  owner: "text-[#d873ff] bg-[#d873ff]/10",
  admin: "text-[#8ff5ff] bg-[#8ff5ff]/10",
  member: "text-[var(--cd-on-surface-variant)] bg-[var(--cd-surface-container)]",
};

export default function MemberManager({ orgId, initialMembers }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationMember["role"]>("member");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await addMemberByEmail(orgId, email, role);
      if (result.ok) {
        setMessage({ kind: "ok", text: result.message ?? "Member added" });
        setEmail("");
        // Use email as optimistic key — replaced on next server render
        const optimisticEmail = email.trim().toLowerCase();
        setMembers((prev) =>
          prev.some((m) => m.email === optimisticEmail)
            ? prev
            : [
                ...prev,
                {
                  user_id: `optimistic:${optimisticEmail}`,
                  email: optimisticEmail,
                  role,
                  joined_at: new Date().toISOString(),
                },
              ]
        );
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  function handleRemove(userId: string) {
    startTransition(async () => {
      const result = await removeMember(orgId, userId);
      if (result.ok) {
        setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  function handleRoleChange(userId: string, newRole: OrganizationMember["role"]) {
    startTransition(async () => {
      const result = await updateMemberRole(orgId, userId, newRole);
      if (result.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m))
        );
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleAdd}
        className="flex flex-wrap gap-2 items-start rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-4"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="flex-1 min-w-[200px] rounded-md border border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface)] px-3 py-2 text-sm text-[var(--cd-on-surface)] placeholder:text-[var(--cd-on-surface-variant)]/60 focus:border-[var(--cd-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--cd-tertiary)]"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as OrganizationMember["role"])}
          className="rounded-md border border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface)] px-3 py-2 text-sm text-[var(--cd-on-surface)] focus:border-[var(--cd-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--cd-tertiary)]"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--cd-tertiary)] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[var(--cd-surface)] transition-all hover:brightness-110 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          {isPending ? "Adding..." : "Add"}
        </button>
      </form>

      {message && (
        <div
          className={`rounded-md px-4 py-2 text-sm ${
            message.kind === "ok"
              ? "bg-[#a2f31f]/10 text-[#a2f31f] border border-[#a2f31f]/30"
              : "bg-[#ff716c]/10 text-[#ff716c] border border-[#ff716c]/30"
          }`}
        >
          {message.text}
        </div>
      )}

      {members.length === 0 ? (
        <div className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-8 text-center">
          <p className="text-sm text-[var(--cd-on-surface-variant)]">
            No members yet. Add one above.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] overflow-hidden">
          <ul className="divide-y divide-[var(--cd-surface-container-highest)]/50">
            {members.map((m) => (
              <li
                key={m.user_id}
                className="flex items-center gap-3 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--cd-primary)]/10">
                  <span className="material-symbols-outlined text-[var(--cd-primary)] text-lg">
                    person
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--cd-on-surface)] truncate">
                    {m.email}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--cd-on-surface-variant)]">
                    Joined {new Date(m.joined_at).toLocaleDateString()}
                  </p>
                </div>

                <select
                  value={m.role}
                  disabled={m.user_id.startsWith("optimistic:") || isPending}
                  onChange={(e) =>
                    handleRoleChange(
                      m.user_id,
                      e.target.value as OrganizationMember["role"]
                    )
                  }
                  className={`rounded px-2 py-1 text-[10px] font-mono uppercase tracking-widest border ${roleStyles[m.role]} border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--cd-tertiary)] focus:ring-offset-1 focus:ring-offset-[var(--cd-surface-container-low)]`}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleRemove(m.user_id)}
                  disabled={m.user_id.startsWith("optimistic:") || isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--cd-on-surface-variant)] hover:bg-[#ff716c]/10 hover:text-[#ff716c] transition-colors disabled:opacity-50"
                  aria-label="Remove member"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    person_remove
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
