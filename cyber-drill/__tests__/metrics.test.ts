import { describe, it, expect } from "vitest";
import { aggregateCampaignStats } from "@/lib/phishing/metrics";
import type { RecipientRow, EventRow } from "@/lib/phishing/metrics";

const recipients: RecipientRow[] = [
  { id: "r1", status: "sent" },
  { id: "r2", status: "sent" },
  { id: "r3", status: "sent" },
  { id: "r4", status: "failed" },
  { id: "r5", status: "pending" },
];

const events: EventRow[] = [
  { recipient_id: "r1", event_type: "open" },
  { recipient_id: "r1", event_type: "open" }, // duplicate open — should count once
  { recipient_id: "r1", event_type: "click" },
  { recipient_id: "r2", event_type: "open" },
  // r3 sent but no events
];

describe("aggregateCampaignStats", () => {
  const stats = aggregateCampaignStats(recipients, events);

  it("counts total recipients correctly", () => {
    expect(stats.total).toBe(5);
  });

  it("counts sent recipients correctly", () => {
    expect(stats.sent).toBe(3);
  });

  it("counts failed recipients correctly", () => {
    expect(stats.failed).toBe(1);
  });

  it("deduplicates opens per recipient", () => {
    expect(stats.opened).toBe(2); // r1 and r2 (not double-counted)
  });

  it("counts unique clickers", () => {
    expect(stats.clicked).toBe(1); // only r1
  });

  it("calculates openRate against sent (not total)", () => {
    expect(stats.openRate).toBe(Math.round((2 / 3) * 100)); // 67%
  });

  it("calculates clickRate against sent (not total)", () => {
    expect(stats.clickRate).toBe(Math.round((1 / 3) * 100)); // 33%
  });

  it("returns zero rates when nothing is sent", () => {
    const s = aggregateCampaignStats([], []);
    expect(s.openRate).toBe(0);
    expect(s.clickRate).toBe(0);
  });

  it("handles all failed — no opens or clicks possible", () => {
    const s = aggregateCampaignStats(
      [{ id: "x1", status: "failed" }],
      []
    );
    expect(s.sent).toBe(0);
    expect(s.openRate).toBe(0);
  });
});
