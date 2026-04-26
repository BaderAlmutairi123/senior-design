export interface RecipientRow {
  id: string;
  status: string;
}

export interface EventRow {
  recipient_id: string;
  event_type: string;
}

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

export function aggregateCampaignStats(
  recipients: RecipientRow[],
  events: EventRow[]
): CampaignStats {
  const sent = recipients.filter((r) => r.status === "sent").length;
  const failed = recipients.filter((r) => r.status === "failed").length;

  const openedIds = new Set(
    events.filter((e) => e.event_type === "open").map((e) => e.recipient_id)
  );
  const clickedIds = new Set(
    events.filter((e) => e.event_type === "click").map((e) => e.recipient_id)
  );

  const opened = openedIds.size;
  const clicked = clickedIds.size;

  return {
    total: recipients.length,
    sent,
    failed,
    opened,
    clicked,
    openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
    clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
  };
}
