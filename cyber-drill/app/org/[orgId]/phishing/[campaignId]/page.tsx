import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth/roles";
import { getCampaignReport } from "@/lib/phishing/queries";
import { TEMPLATE_LABELS, type TemplateKey } from "@/lib/email/templates";
import AppShell from "@/components/layout/AppShell";
import SendButton from "./SendButton";

const STATUS_CHIP: Record<string, string> = {
  draft: "bg-[var(--cd-surface-container-high)] text-[var(--cd-on-surface-variant)]",
  sending: "bg-yellow-500/20 text-yellow-400",
  sent: "bg-[#a2f31f]/15 text-[#a2f31f]",
  failed: "bg-red-500/15 text-red-400",
};

export default async function CampaignReportPage({
  params,
}: {
  params: Promise<{ orgId: string; campaignId: string }>;
}) {
  const { orgId, campaignId } = await params;

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

  const report = await getCampaignReport(campaignId);
  if (!report) notFound();

  const { campaign, recipients, events, stats } = report;
  const templateLabel =
    TEMPLATE_LABELS[campaign.template_key as TemplateKey] ?? campaign.template_key;

  const eventsByRecipient = new Map<string, { click?: string }>();
  for (const e of events) {
    const existing = eventsByRecipient.get(e.recipient_id) ?? {};
    if (e.event_type === "click" && !existing.click) existing.click = e.occurred_at;
    eventsByRecipient.set(e.recipient_id, existing);
  }

  const isDraft = campaign.status === "draft";

  return (
    <AppShell
      email={user.email ?? ""}
      activePath={`/org/${orgId}/phishing`}
      isAdmin={userIsAdmin}
      orgId={orgId}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-6">
        <Link href={`/org/${orgId}/phishing`} className="hover:text-[var(--cd-primary)]">
          Phishing Campaigns
        </Link>
        <span>/</span>
        <span className="text-[var(--cd-on-surface)]">{campaign.name}</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-headline font-bold text-3xl tracking-tighter text-[var(--cd-on-surface)]">
              {campaign.name}
            </h1>
            <span
              className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-mono uppercase tracking-widest ${
                STATUS_CHIP[campaign.status] ?? ""
              }`}
            >
              {campaign.status}
            </span>
          </div>
          <p className="text-sm text-[var(--cd-on-surface-variant)]">
            Template: {templateLabel} &middot; Created{" "}
            {new Date(campaign.created_at).toLocaleDateString()}
          </p>
        </div>
        {isDraft && <SendButton campaignId={campaignId} />}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Recipients", value: stats.total, color: "#8ff5ff", icon: "group" },
          { label: "Sent", value: stats.sent, color: "#a2f31f", icon: "mark_email_read" },
          { label: "Clicked", value: `${stats.clicked} (${stats.clickRate}%)`, color: "#ff6b6b", icon: "ads_click" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px]" style={{ color: s.color }}>
                {s.icon}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cd-on-surface-variant)]">
                {s.label}
              </span>
            </div>
            <p className="font-headline font-bold text-2xl text-[var(--cd-on-surface)]">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Per-recipient table */}
      <section>
        <h2 className="font-headline font-bold text-lg text-[var(--cd-on-surface)] mb-4">
          Recipients
        </h2>
        <div className="rounded-lg border border-[var(--cd-surface-container-highest)]/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--cd-surface-container-high)]">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                  Clicked
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)]">
              {recipients.map((r) => {
                const ev = eventsByRecipient.get(r.id) ?? {};
                return (
                  <tr key={r.id} className="hover:bg-[var(--cd-surface-container-high)] transition-colors">
                    <td className="px-4 py-3 text-[var(--cd-on-surface)]">{r.recipient_email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-xs uppercase ${
                          r.status === "sent"
                            ? "text-[#a2f31f]"
                            : r.status === "failed"
                            ? "text-red-400"
                            : "text-[var(--cd-on-surface-variant)]"
                        }`}
                      >
                        {r.status}
                      </span>
                      {r.error && (
                        <span className="ml-2 text-[10px] text-red-400/70">{r.error}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--cd-on-surface-variant)]">
                      {ev.click ? (
                        <span className="text-[#ff6b6b]">
                          {new Date(ev.click).toLocaleString()}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
