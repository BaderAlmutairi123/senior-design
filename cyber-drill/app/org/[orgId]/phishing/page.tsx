import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth/roles";
import { listCampaigns } from "@/lib/phishing/queries";
import AppShell from "@/components/layout/AppShell";

const STATUS_COLORS: Record<string, string> = {
  draft: "text-[var(--cd-on-surface-variant)]",
  sending: "text-yellow-400",
  sent: "text-[#a2f31f]",
  failed: "text-red-400",
};

export default async function PhishingCampaignsPage({
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

  const campaigns = await listCampaigns(orgId);

  return (
    <AppShell
      email={user.email ?? ""}
      activePath={`/org/${orgId}/phishing`}
      isAdmin={userIsAdmin}
      orgId={orgId}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--cd-primary)]/10">
            <span className="material-symbols-outlined text-[var(--cd-primary)] text-2xl">
              phishing
            </span>
          </div>
          <div>
            <h1 className="font-headline font-bold text-3xl tracking-tighter text-[var(--cd-on-surface)]">
              Phishing Campaigns
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
              Simulated email campaigns for security awareness
            </p>
          </div>
        </div>
        <Link
          href={`/org/${orgId}/phishing/new`}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--cd-primary)] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[var(--cd-surface)] transition-all hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-[var(--cd-on-surface-variant)] mb-3 block">
            phishing
          </span>
          <p className="text-sm text-[var(--cd-on-surface-variant)]">
            No phishing campaigns yet. Create your first one to start awareness testing.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--cd-surface-container-high)]">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                  Campaign
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                  Created
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)]">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--cd-surface-container-high)] transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--cd-on-surface)]">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--cd-on-surface-variant)]">
                    {c.template_key}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-xs uppercase ${STATUS_COLORS[c.status] ?? ""}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--cd-on-surface-variant)]">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/org/${orgId}/phishing/${c.id}`}
                      className="text-[var(--cd-primary)] hover:underline text-xs font-mono uppercase tracking-wider"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
