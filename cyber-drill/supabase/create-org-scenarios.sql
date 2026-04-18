-- ─────────────────────────────────────────────────────────────────────────
-- Sprint 3 Week 2 — Organization scenario assignments + helpers
--
-- Adds:
--   1. organization_scenarios table: scenarios assigned to an org
--   2. public.find_user_id_by_email(email) - SECURITY DEFINER helper for
--      admins/org managers to look up a user by email when inviting them
--      (client can't query auth.users directly).
--   3. public.get_user_emails(uids) - SECURITY DEFINER batch lookup so the
--      admin UI can display real emails next to user IDs.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. organization_scenarios assignment table
CREATE TABLE IF NOT EXISTS organization_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, scenario_id)
);

CREATE INDEX IF NOT EXISTS idx_org_scenarios_org ON organization_scenarios(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_scenarios_scenario ON organization_scenarios(scenario_id);

ALTER TABLE organization_scenarios ENABLE ROW LEVEL SECURITY;

-- Members of an org can see what's assigned to them
DROP POLICY IF EXISTS "Org members can read assigned scenarios" ON organization_scenarios;
CREATE POLICY "Org members can read assigned scenarios"
  ON organization_scenarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = organization_scenarios.organization_id
        AND uo.user_id = auth.uid()
    )
  );

-- Platform admins + org owners/admins can manage assignments
DROP POLICY IF EXISTS "Platform admins can manage assignments" ON organization_scenarios;
CREATE POLICY "Platform admins can manage assignments"
  ON organization_scenarios FOR ALL
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Org owners and admins can manage assignments" ON organization_scenarios;
CREATE POLICY "Org owners and admins can manage assignments"
  ON organization_scenarios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = organization_scenarios.organization_id
        AND uo.user_id = auth.uid()
        AND uo.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = organization_scenarios.organization_id
        AND uo.user_id = auth.uid()
        AND uo.role IN ('owner', 'admin')
    )
  );

-- 2. Look up a user by email (admins/org managers only)
CREATE OR REPLACE FUNCTION public.find_user_id_by_email(lookup_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller UUID := auth.uid();
  found_id UUID;
BEGIN
  IF caller IS NULL THEN
    RETURN NULL;
  END IF;

  -- Only platform admins or users who own/admin at least one org can use this
  IF NOT (
    public.is_platform_admin(caller)
    OR EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_id = caller AND role IN ('owner', 'admin')
    )
  ) THEN
    RETURN NULL;
  END IF;

  SELECT id INTO found_id FROM auth.users WHERE email = lookup_email LIMIT 1;
  RETURN found_id;
END;
$$;

REVOKE ALL ON FUNCTION public.find_user_id_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_user_id_by_email(TEXT) TO authenticated;

-- 3. Batch lookup: map user IDs to emails (admins + org managers)
CREATE OR REPLACE FUNCTION public.get_user_emails(uids UUID[])
RETURNS TABLE(user_id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN
    RETURN;
  END IF;

  IF NOT (
    public.is_platform_admin(caller)
    OR EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_id = caller AND role IN ('owner', 'admin')
    )
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT u.id AS user_id, u.email::TEXT
    FROM auth.users u
    WHERE u.id = ANY(uids);
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_emails(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_emails(UUID[]) TO authenticated;
