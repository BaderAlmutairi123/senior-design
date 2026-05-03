-- ─────────────────────────────────────────────────────────────────────────
-- Phishing simulation: campaigns, recipients, and tracking events
--
-- Prerequisites: organizations table, auth.users, is_org_manager() function
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS phishing_campaigns (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text        NOT NULL,
  template_key     text        NOT NULL,
  status           text        NOT NULL DEFAULT 'draft',  -- draft|sending|sent|failed
  created_by       uuid        NOT NULL REFERENCES auth.users(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  sent_at          timestamptz
);

CREATE INDEX IF NOT EXISTS idx_phishing_campaigns_org ON phishing_campaigns(organization_id);

CREATE TABLE IF NOT EXISTS phishing_recipients (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         uuid        NOT NULL REFERENCES phishing_campaigns(id) ON DELETE CASCADE,
  recipient_user_id   uuid        REFERENCES auth.users(id),
  recipient_email     text        NOT NULL,
  tracking_token      text        NOT NULL UNIQUE,
  status              text        NOT NULL DEFAULT 'pending',  -- pending|sent|failed
  resend_message_id   text,
  sent_at             timestamptz,
  error               text
);

CREATE INDEX IF NOT EXISTS idx_phishing_recipients_campaign ON phishing_recipients(campaign_id);

CREATE TABLE IF NOT EXISTS phishing_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id  uuid        NOT NULL REFERENCES phishing_recipients(id) ON DELETE CASCADE,
  event_type    text        NOT NULL,  -- open|click
  url           text,
  user_agent    text,
  ip_address    inet,
  occurred_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_phishing_events_recipient ON phishing_events(recipient_id, event_type);

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE phishing_campaigns  ENABLE ROW LEVEL SECURITY;
ALTER TABLE phishing_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE phishing_events     ENABLE ROW LEVEL SECURITY;

-- Campaigns: readable by org manager or platform admin
CREATE POLICY campaigns_select ON phishing_campaigns FOR SELECT
  USING (
    public.is_org_manager(auth.uid(), organization_id)
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Recipients: readable through campaign ownership check
CREATE POLICY recipients_select ON phishing_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM phishing_campaigns c
      WHERE c.id = campaign_id
        AND (
          public.is_org_manager(auth.uid(), c.organization_id)
          OR EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

-- Events: readable through recipient → campaign ownership chain
CREATE POLICY events_select ON phishing_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM phishing_recipients r
      JOIN phishing_campaigns c ON c.id = r.campaign_id
      WHERE r.id = recipient_id
        AND (
          public.is_org_manager(auth.uid(), c.organization_id)
          OR EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

-- Writes for campaigns/recipients/events come through the service role client,
-- which bypasses RLS entirely. No INSERT/UPDATE policies needed for anon/authenticated.
