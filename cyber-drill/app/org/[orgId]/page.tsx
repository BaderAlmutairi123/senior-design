import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  getOrganizationById,
  getOrganizationMembers,
  getOrganizationScenarioIds,
  getOrgInviteCodes,
  getOrgScenarios,
} from "@/lib/organizations/queries";
import { getScenarios } from "@/lib/scenarios/queries";
import { isAdmin } from "@/lib/auth/roles";
import AppShell from "@/components/layout/AppShell";
import MemberManager from "@/app/admin/organizations/[id]/MemberManager";
import InviteCodeManager from "@/app/admin/organizations/[id]/InviteCodeManager";
import ScenarioAssigner from "@/app/admin/organizations/[id]/ScenarioAssigner";
import OrgScenarioList from "./OrgScenarioList";

export default async function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("user_organizations")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .single();

  const userIsAdmin = await isAdmin(user.id);

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    if (!userIsAdmin) redirect("/");
  }

  const [org, members, allScenarios, assignedIds, inviteCodes, orgScenarios] =
    await Promise.all([
      getOrganizationById(orgId),
      getOrganizationMembers(orgId),
      getScenarios(),
      getOrganizationScenarioIds(orgId),
      getOrgInviteCodes(orgId),
      getOrgScenarios(orgId),
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
      label: "Custom Scenarios",
      value: orgScenarios.length,
      icon: "edit_note",
      color: "#d873ff",
    },
  ];

  return (
    <AppShell
      email={user.email ?? ""}
      activePath={`/org/${orgId}`}
      isAdmin={userIsAdmin}
      orgId={orgId}
    >
      {/* Header */}
      <div className="mb-8">
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
              Organization Dashboard
            </p>
          </div>
        </div>
        {org.description && (
          <p className="mt-2 text-sm text-[var(--cd-on-surface-variant)] max-w-2xl">
            {org.description}
          </p>
        )}
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

      {/* Custom Scenarios */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline font-bold text-lg text-[var(--cd-on-surface)]">
            Custom Scenarios
          </h2>
          <Link
            href={`/org/${orgId}/scenarios/new`}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--cd-tertiary)] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[var(--cd-surface)] transition-all hover:brightness-110"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Scenario
          </Link>
        </div>
        <p className="text-sm text-[var(--cd-on-surface-variant)] mb-4">
          Scenarios you create here are only visible to your organization members.
        </p>
        <OrgScenarioList orgId={orgId} scenarios={orgScenarios} />
      </section>

      {/* Assign existing public scenarios */}
      <section>
        <h2 className="font-headline font-bold text-lg text-[var(--cd-on-surface)] mb-4">
          Assign Public Scenarios
        </h2>
        <p className="text-sm text-[var(--cd-on-surface-variant)] mb-4">
          Assign platform scenarios as required training for your members.
        </p>
        <ScenarioAssigner
          orgId={org.id}
          scenarios={allScenarios}
          initiallyAssignedIds={assignedIds}
        />
      </section>
    </AppShell>
  );
}
