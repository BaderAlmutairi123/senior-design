"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOrgManager } from "./auth";
import { generateTrackingToken, buildPixelUrl, buildClickUrl } from "./tokens";
import { sendPhishingEmail } from "@/lib/email/resend";
import { templateRegistry, TEMPLATE_KEYS, type TemplateKey } from "@/lib/email/templates";

export async function createCampaign(
  orgId: string,
  name: string,
  templateKey: string
): Promise<{ ok: true; campaignId: string } | { ok: false; error: string }> {
  let userId: string;
  try {
    userId = await requireOrgManager(orgId);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  if (!name.trim()) return { ok: false, error: "Campaign name is required" };
  if (!TEMPLATE_KEYS.includes(templateKey as TemplateKey)) {
    return { ok: false, error: "Invalid template key" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("phishing_campaigns")
    .insert({ organization_id: orgId, name: name.trim(), template_key: templateKey, created_by: userId })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Failed to create campaign" };
  revalidatePath(`/org/${orgId}/phishing`);
  return { ok: true, campaignId: data.id };
}

export async function addRecipientsFromOrg(
  campaignId: string,
  orgId: string,
  members: { user_id: string; email: string }[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireOrgManager(orgId);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  if (members.length === 0) return { ok: false, error: "Select at least one recipient" };

  const admin = createAdminClient();
  const rows = members.map((m) => ({
    campaign_id: campaignId,
    recipient_user_id: m.user_id,
    recipient_email: m.email,
    tracking_token: generateTrackingToken(),
  }));

  const { error } = await admin.from("phishing_recipients").insert(rows);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendCampaign(
  campaignId: string
): Promise<{ ok: boolean; sent: number; failed: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, sent: 0, failed: 0, error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: campaign, error: campaignErr } = await admin
    .from("phishing_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();
  if (campaignErr || !campaign) return { ok: false, sent: 0, failed: 0, error: "Campaign not found" };

  try {
    await requireOrgManager(campaign.organization_id);
  } catch (e) {
    return { ok: false, sent: 0, failed: 0, error: (e as Error).message };
  }

  await admin.from("phishing_campaigns").update({ status: "sending" }).eq("id", campaignId);

  const { data: recipients } = await admin
    .from("phishing_recipients")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("status", "pending");

  const renderFn = templateRegistry[campaign.template_key as TemplateKey];
  if (!renderFn) {
    await admin.from("phishing_campaigns").update({ status: "failed" }).eq("id", campaignId);
    return { ok: false, sent: 0, failed: 0, error: "Unknown template key" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let sentCount = 0;
  let failedCount = 0;

  for (const r of recipients ?? []) {
    const { subject, html, text } = renderFn({
      recipient_name: r.recipient_email.split("@")[0],
      action_url: buildClickUrl(r.tracking_token, `${appUrl}/scenarios`),
      tracking_pixel_url: buildPixelUrl(r.tracking_token),
    });

    const result = await sendPhishingEmail({ to: r.recipient_email, subject, html, text });

    if ("error" in result) {
      await admin
        .from("phishing_recipients")
        .update({ status: "failed", error: result.error })
        .eq("id", r.id);
      failedCount++;
    } else {
      await admin
        .from("phishing_recipients")
        .update({ status: "sent", resend_message_id: result.id, sent_at: new Date().toISOString() })
        .eq("id", r.id);
      sentCount++;
    }
  }

  const finalStatus = failedCount === 0 ? "sent" : sentCount === 0 ? "failed" : "sent";
  await admin
    .from("phishing_campaigns")
    .update({ status: finalStatus, sent_at: new Date().toISOString() })
    .eq("id", campaignId);

  revalidatePath(`/org/${campaign.organization_id}/phishing/${campaignId}`);
  revalidatePath(`/org/${campaign.organization_id}/phishing`);
  return { ok: true, sent: sentCount, failed: failedCount };
}
