-- ─────────────────────────────────────────────────────────────────────────
-- Fix: platform admins need full access to organization-related tables
--
-- The recursion fix added member/manager policies but forgot to add
-- platform-admin policies for INSERT, DELETE, etc. This caused:
--   "new row violates row-level security policy for table 'organizations'"
-- when an admin tried to create an organization.
--
-- Run this AFTER fix-user-organizations-recursion.sql. Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Platform admins can do everything on organizations
DROP POLICY IF EXISTS "Platform admins can manage all organizations" ON organizations;
CREATE POLICY "Platform admins can manage all organizations"
  ON organizations FOR ALL
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- 2. Platform admins can do everything on user_organizations
DROP POLICY IF EXISTS "Platform admins can manage all memberships" ON user_organizations;
CREATE POLICY "Platform admins can manage all memberships"
  ON user_organizations FOR ALL
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- 3. Platform admins can do everything on organization_scenarios
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organization_scenarios') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Platform admins can manage all scenario assignments" ON organization_scenarios';
    EXECUTE 'CREATE POLICY "Platform admins can manage all scenario assignments"
               ON organization_scenarios FOR ALL
               USING (public.is_platform_admin(auth.uid()))
               WITH CHECK (public.is_platform_admin(auth.uid()))';
  END IF;
END
$$;

-- 4. organization_invites already has a platform admin policy from
--    create-onboarding.sql ("Platform admins can manage invites"),
--    but add it here too in case it's missing.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organization_invites') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Platform admins can manage invites" ON organization_invites';
    EXECUTE 'CREATE POLICY "Platform admins can manage invites"
               ON organization_invites FOR ALL
               USING (public.is_platform_admin(auth.uid()))
               WITH CHECK (public.is_platform_admin(auth.uid()))';
  END IF;
END
$$;
