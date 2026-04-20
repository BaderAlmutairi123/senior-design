import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getOrganizationById,
  getOrganizationMembers,
  getOrganizationScenarioIds,
  getOrgInviteCodes,
} from "@/lib/organizations/queries";
import { getScenarios } from "@/lib/scenarios/queries";
import MemberManager from "./MemberManager";
import ScenarioAssigner from "./ScenarioAssigner";
import InviteCodeManager from "./InviteCodeManager";
import DeleteOrgButton from "./DeleteOrgButton";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [org, members, scenarios, assignedIds, inviteCodes] = await Promise.all([
    getOrganizationById(id),
    getOrganizationMembers(id),
    getScenarios(),
    getOrganizationScenarioIds(id),
    getOrgInviteCodes(id),
  ]);

  if (!org) notFound();

  const stats = [
    {
      label: "Members",
      value: members.length,
      icon: "group",
      color: "#8ff5ff",
    },
    {
      label: "Assigned Scenarios",
      value: assignedIds.length,
      icon: "precision_manufacturing",
      color: "#a2f31f",
    },
    {
      label: "Owners & Admins",
      value: members.filter((m) => m.role !== "member").length,
      icon: "shield_person",
      color: "#d873ff",
    },
  ];

  return (
    <>
      <div className="mb-8">
        <Link
          href="/admin/organizations"
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] hover:text-[var(--cd-tertiary)] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Organizations
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--cd-tertiary)]/10">
                <span className="material-symbols-outlined text-[var(--cd-tertiary)] text-2xl">
                  corporate_fare
                </span>
              </div>
              <div>
                <h1 className="font-headline font-bold text-3xl tracking-tighter text-[var(--cd-on-surface)]">
                  {org.name}
                </h1>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                  {org.slug}
                </p>
              </div>
            </div>
            {org.description && (
              <p className="mt-2 text-sm text-[var(--cd-on-surface-variant)] max-w-2xl">
                {org.description}
              </p>
            )}
          </div>

          <DeleteOrgButton orgId={org.id} orgName={org.name} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ color: s.color }}
              >
                {s.icon}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cd-on-surface-variant)]">
                {s.label}
              </span>
            </div>
            <p className="font-headline font-bold text-3xl text-[var(--cd-on-surface)]">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Invite Codes */}
      <section className="mb-10">
        <h2 className="font-headline font-bold text-lg text-[var(--cd-on-surface)] mb-4">
          Invite Codes
        </h2>
        <p className="text-sm text-[var(--cd-on-surface-variant)] mb-4">
          Share invite codes with team members so they can join during signup.
        </p>
        <InviteCodeManager orgId={org.id} initialCodes={inviteCodes} />
      </section>

      {/* Members */}
      <section className="mb-10">
        <h2 className="font-headline font-bold text-lg text-[var(--cd-on-surface)] mb-4">
          Members
        </h2>
        <MemberManager orgId={org.id} initialMembers={members} />
      </section>

      {/* Scenario assignments */}
      <section>
        <h2 className="font-headline font-bold text-lg text-[var(--cd-on-surface)] mb-4">
          Scenario Assignments
        </h2>
        <p className="text-sm text-[var(--cd-on-surface-variant)] mb-4">
          Assign scenarios to surface them as required training for this
          organization&apos;s members.
        </p>
        <ScenarioAssigner
          orgId={org.id}
          scenarios={scenarios}
          initiallyAssignedIds={assignedIds}
        />
      </section>
    </>
  );
}
