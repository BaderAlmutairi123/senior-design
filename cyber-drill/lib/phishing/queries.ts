import { createClient } from "@/lib/supabase/server";
import { aggregateCampaignStats, type CampaignStats } from "./metrics";

export interface PhishingCampaign {
  id: string;
  organization_id: string;
  name: string;
  template_key: string;
  status: string;
  created_by: string;
  created_at: string;
  sent_at: string | null;
}

export interface PhishingRecipient {
  id: string;
  campaign_id: string;
  recipient_user_id: string | null;
  recipient_email: string;
  tracking_token: string;
  status: string;
  resend_message_id: string | null;
  sent_at: string | null;
  error: string | null;
}

export interface PhishingEvent {
  id: string;
  recipient_id: string;
  event_type: string;
  url: string | null;
  occurred_at: string;
}

export interface CampaignReport {
  campaign: PhishingCampaign;
  recipients: PhishingRecipient[];
  events: PhishingEvent[];
  stats: CampaignStats;
}

export async function listCampaigns(orgId: string): Promise<PhishingCampaign[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("phishing_campaigns")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as PhishingCampaign[];
}

export async function getCampaign(id: string): Promise<PhishingCampaign | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("phishing_campaigns")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as PhishingCampaign;
}

export async function getCampaignReport(campaignId: string): Promise<CampaignReport | null> {
  const supabase = await createClient();

  const [campaignRes, recipientsRes] = await Promise.all([
    supabase.from("phishing_campaigns").select("*").eq("id", campaignId).single(),
    supabase.from("phishing_recipients").select("*").eq("campaign_id", campaignId).order("sent_at"),
  ]);

  if (campaignRes.error || !campaignRes.data) return null;

  const recipients = (recipientsRes.data ?? []) as PhishingRecipient[];
  const recipientIds = recipients.map((r) => r.id);

  let events: PhishingEvent[] = [];
  if (recipientIds.length > 0) {
    const { data: eventsData } = await supabase
      .from("phishing_events")
      .select("id, recipient_id, event_type, url, occurred_at")
      .in("recipient_id", recipientIds)
      .order("occurred_at");
    events = (eventsData ?? []) as PhishingEvent[];
  }

  const stats = aggregateCampaignStats(
    recipients.map((r) => ({ id: r.id, status: r.status })),
    events.map((e) => ({ recipient_id: e.recipient_id, event_type: e.event_type }))
  );

  return {
    campaign: campaignRes.data as PhishingCampaign,
    recipients,
    events,
    stats,
  };
}
