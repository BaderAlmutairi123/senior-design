"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  onboardStandalone,
  onboardAsOrgMember,
  onboardAsAdmin,
} from "@/lib/onboarding/actions";

type Role = null | "standalone" | "organization" | "admin";

export default function OnboardingFlow() {
  const [role, setRole] = useState<Role>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSelect(selected: Role) {
    setRole(selected);
    setError(null);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      if (role === "standalone") {
        await onboardStandalone();
      } else if (role === "organization") {
        const result = await onboardAsOrgMember(inviteCode);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push("/");
      } else if (role === "admin") {
        const result = await onboardAsAdmin(orgName);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push("/org");
      }
    });
  }

  const roleCards: {
    id: NonNullable<Role>;
    title: string;
    desc: string;
    icon: string;
    color: string;
  }[] = [
    {
      id: "standalone",
      title: "Standalone User",
      desc: "Practice cybersecurity awareness on your own with our library of social-engineering scenarios.",
      icon: "person",
      color: "#8ff5ff",
    },
    {
      id: "organization",
      title: "Organization Member",
      desc: "Join your company's CyberDrill workspace using an invite code from your admin.",
      icon: "group",
      color: "#a2f31f",
    },
    {
      id: "admin",
      title: "Admin / Trainer",
      desc: "Create an organization, invite team members, build custom scenarios, and track their progress.",
      icon: "admin_panel_settings",
      color: "#d873ff",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cd-surface)] p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[var(--cd-primary)] text-3xl">
              shield
            </span>
            <span className="font-headline font-bold text-2xl tracking-tighter text-[var(--cd-on-surface)]">
              CyberDrill
            </span>
          </div>
          <h1 className="font-headline font-bold text-3xl tracking-tighter text-[var(--cd-on-surface)]">
            How will you use CyberDrill?
          </h1>
          <p className="mt-2 text-sm text-[var(--cd-on-surface-variant)]">
            Choose the option that best describes you.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid gap-4">
          {roleCards.map((card) => {
            const isSelected = role === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelect(card.id)}
                className={`flex items-start gap-4 rounded-lg border p-5 text-left transition-all ${
                  isSelected
                    ? "border-[var(--cd-primary)] bg-[var(--cd-primary)]/5 shadow-lg"
                    : "border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] hover:border-[var(--cd-primary)]/30"
                }`}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors"
                  style={{
                    backgroundColor: isSelected
                      ? `${card.color}20`
                      : "var(--cd-surface-container)",
                    color: isSelected
                      ? card.color
                      : "var(--cd-on-surface-variant)",
                  }}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {card.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-headline font-bold text-[var(--cd-on-surface)]">
                    {card.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--cd-on-surface-variant)]">
                    {card.desc}
                  </p>
                </div>
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 mt-1 transition-all ${
                    isSelected
                      ? "border-[var(--cd-primary)] bg-[var(--cd-primary)]"
                      : "border-[var(--cd-surface-container-highest)]"
                  }`}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-sm text-[var(--cd-surface)]">
                      check
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Conditional input based on selection */}
        {role === "organization" && (
          <div className="mt-6 rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-5">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={20}
              className="w-full rounded-md border border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface)] px-4 py-3 text-center font-mono text-xl tracking-[0.3em] text-[var(--cd-on-surface)] placeholder:text-[var(--cd-on-surface-variant)]/40 focus:border-[var(--cd-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--cd-primary)]"
            />
            <p className="mt-2 text-xs text-[var(--cd-on-surface-variant)]">
              Ask your organization admin for the code.
            </p>
          </div>
        )}

        {role === "admin" && (
          <div className="mt-6 rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-5">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              maxLength={100}
              className="w-full rounded-md border border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface)] px-4 py-3 text-sm text-[var(--cd-on-surface)] placeholder:text-[var(--cd-on-surface-variant)]/40 focus:border-[var(--cd-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--cd-primary)]"
            />
            <p className="mt-2 text-xs text-[var(--cd-on-surface-variant)]">
              You&apos;ll be the owner. You can invite team members and create
              custom scenarios later.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-md border border-[#ff716c]/30 bg-[#ff716c]/10 px-4 py-3 text-sm text-[#ff716c]">
            {error}
          </div>
        )}

        {/* Submit */}
        {role && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isPending ||
              (role === "organization" && !inviteCode.trim()) ||
              (role === "admin" && !orgName.trim())
            }
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-md bg-[var(--cd-primary)] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-[var(--cd-surface)] transition-all hover:brightness-110 hover:shadow-[0_0_24px_rgba(143,245,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                Setting up...
              </>
            ) : role === "standalone" ? (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
                Get Started
              </>
            ) : role === "organization" ? (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  vpn_key
                </span>
                Join Organization
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  rocket_launch
                </span>
                Create Organization
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
