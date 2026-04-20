import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/roles";
import { getOrganizationById } from "@/lib/organizations/queries";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import OrgScenarioForm from "./OrgScenarioForm";

export default async function NewOrgScenarioPage({
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

  const org = await getOrganizationById(orgId);
  if (!org) redirect("/");

  return (
    <AppShell
      email={user.email ?? ""}
      activePath={`/org/${orgId}`}
      isAdmin={userIsAdmin}
      orgId={orgId}
    >
      <div className="mb-6">
        <Link
          href={`/org/${orgId}`}
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] hover:text-[var(--cd-tertiary)] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to {org.name}
        </Link>

        <h1 className="font-headline font-bold text-3xl tracking-tighter text-[var(--cd-on-surface)]">
          Create Scenario
        </h1>
        <p className="mt-1 text-sm text-[var(--cd-on-surface-variant)]">
          This scenario will only be visible to members of {org.name}.
        </p>
      </div>

      <OrgScenarioForm orgId={orgId} />
    </AppShell>
  );
}
