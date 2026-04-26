import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth/roles";
import { getOrganizationById, getOrganizationMembers } from "@/lib/organizations/queries";
import AppShell from "@/components/layout/AppShell";
import CampaignForm from "../CampaignForm";

export default async function NewCampaignPage({
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

  const [org, members] = await Promise.all([
    getOrganizationById(orgId),
    getOrganizationMembers(orgId),
  ]);

  if (!org) redirect("/");

  return (
    <AppShell
      email={user.email ?? ""}
      activePath={`/org/${orgId}/phishing`}
      isAdmin={userIsAdmin}
      orgId={orgId}
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-4">
          <Link href={`/org/${orgId}/phishing`} className="hover:text-[var(--cd-primary)]">
            Phishing Campaigns
          </Link>
          <span>/</span>
          <span>New</span>
        </div>
        <h1 className="font-headline font-bold text-3xl tracking-tighter text-[var(--cd-on-surface)]">
          New Phishing Campaign
        </h1>
        <p className="mt-1 text-sm text-[var(--cd-on-surface-variant)]">
          Choose a template and select recipients from <strong>{org.name}</strong>. You can send
          the campaign from the report page after creation.
        </p>
      </div>

      <CampaignForm orgId={orgId} members={members} />
    </AppShell>
  );
}
