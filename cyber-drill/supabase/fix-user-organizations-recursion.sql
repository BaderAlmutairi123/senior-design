-- ─────────────────────────────────────────────────────────────────────────
-- Fix: infinite recursion in user_organizations RLS policies
--
-- Several policies did EXISTS (SELECT 1 FROM user_organizations ...)
-- to check membership. Those subqueries are themselves subject to RLS,
-- which re-triggers the same policy → infinite recursion.
--
-- Fix: wrap membership checks in SECURITY DEFINER functions that bypass
-- RLS on the internal lookup. Same pattern as is_platform_admin.
--
-- Run this against your existing DB. Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Helpers
CREATE OR REPLACE FUNCTION public.is_org_member(uid UUID, org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_organizations
    WHERE user_id = uid AND organization_id = org_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_org_member(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID, UUID) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_org_manager(uid UUID, org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_organizations
    WHERE user_id = uid
      AND organization_id = org_id
      AND role IN ('owner', 'admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_org_manager(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_org_manager(UUID, UUID) TO authenticated, service_role;

-- 2. Replace recursive policies on user_organizations
DROP POLICY IF EXISTS "Members can read co-members" ON user_organizations;
CREATE POLICY "Members can read co-members"
  ON user_organizations FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Org owners and admins can manage memberships" ON user_organizations;
CREATE POLICY "Org owners and admins can manage memberships"
  ON user_organizations FOR ALL
  USING (public.is_org_manager(auth.uid(), organization_id))
  WITH CHECK (public.is_org_manager(auth.uid(), organization_id));

-- Allow a user to add themselves as the first owner of a new org during
-- onboarding. Without this, the very first INSERT into user_organizations
-- for an org has no manager yet, so is_org_manager() returns false.
DROP POLICY IF EXISTS "Users can add themselves as owner" ON user_organizations;
CREATE POLICY "Users can add themselves as owner"
  ON user_organizations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'owner'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_organizations existing
      WHERE existing.organization_id = user_organizations.organization_id
    )
  );

-- 3. Replace policies on organizations that query user_organizations
DROP POLICY IF EXISTS "Members can read their organizations" ON organizations;
CREATE POLICY "Members can read their organizations"
  ON organizations FOR SELECT
  USING (public.is_org_member(auth.uid(), id));

DROP POLICY IF EXISTS "Org owners and admins can update their org" ON organizations;
CREATE POLICY "Org owners and admins can update their org"
  ON organizations FOR UPDATE
  USING (public.is_org_manager(auth.uid(), id))
  WITH CHECK (public.is_org_manager(auth.uid(), id));

-- 4. Replace policies on organization_scenarios (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organization_scenarios') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Org members can read assigned scenarios" ON organization_scenarios';
    EXECUTE 'CREATE POLICY "Org members can read assigned scenarios"
               ON organization_scenarios FOR SELECT
               USING (public.is_org_member(auth.uid(), organization_id))';

    EXECUTE 'DROP POLICY IF EXISTS "Org owners and admins can manage assignments" ON organization_scenarios';
    EXECUTE 'CREATE POLICY "Org owners and admins can manage assignments"
               ON organization_scenarios FOR ALL
               USING (public.is_org_manager(auth.uid(), organization_id))
               WITH CHECK (public.is_org_manager(auth.uid(), organization_id))';
  END IF;
END
$$;

-- 5. Replace policies on organization_invites (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organization_invites') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Org owners and admins can manage invites" ON organization_invites';
    EXECUTE 'CREATE POLICY "Org owners and admins can manage invites"
               ON organization_invites FOR ALL
               USING (public.is_org_manager(auth.uid(), organization_id))
               WITH CHECK (public.is_org_manager(auth.uid(), organization_id))';
  END IF;
END
$$;
