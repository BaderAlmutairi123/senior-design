-- ─────────────────────────────────────────────────────────────────────────
-- Fix: "infinite recursion detected in policy for relation user_roles"
--
-- The original admin policies on user_roles (and on scenarios /
-- user_progress / feedback) did an EXISTS subquery against user_roles.
-- That subquery is itself subject to RLS, which re-triggers the same
-- policy → infinite recursion.
--
-- Fix: wrap the admin check in a SECURITY DEFINER function. SECURITY
-- DEFINER functions run with the owner's rights and bypass RLS on the
-- internal SELECT, so the check resolves in a single hop with no
-- recursion.
--
-- Run this against your existing DB. It is idempotent.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Helper function (idempotent)
CREATE OR REPLACE FUNCTION public.is_platform_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = uid AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_platform_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO authenticated, anon, service_role;

-- 2. Replace the recursive policies on user_roles
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;
CREATE POLICY "Admins can read all roles"
  ON user_roles FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- 3. Replace admin policies on scenarios
DROP POLICY IF EXISTS "Admins can read all scenarios" ON scenarios;
CREATE POLICY "Admins can read all scenarios"
  ON scenarios FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert scenarios" ON scenarios;
CREATE POLICY "Admins can insert scenarios"
  ON scenarios FOR INSERT
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update scenarios" ON scenarios;
CREATE POLICY "Admins can update scenarios"
  ON scenarios FOR UPDATE
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete scenarios" ON scenarios;
CREATE POLICY "Admins can delete scenarios"
  ON scenarios FOR DELETE
  USING (public.is_platform_admin(auth.uid()));

-- 4. Replace admin policies on user_progress
DROP POLICY IF EXISTS "Admins can read all progress" ON user_progress;
CREATE POLICY "Admins can read all progress"
  ON user_progress FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

-- 5. Replace admin policies on feedback
DROP POLICY IF EXISTS "Admins can read all feedback" ON feedback;
CREATE POLICY "Admins can read all feedback"
  ON feedback FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

-- 6. If you already ran create-organizations.sql, replace its admin policies too.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organizations') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Platform admins can read all organizations" ON organizations';
    EXECUTE 'CREATE POLICY "Platform admins can read all organizations"
               ON organizations FOR SELECT
               USING (public.is_platform_admin(auth.uid()))';

    EXECUTE 'DROP POLICY IF EXISTS "Platform admins can manage organizations" ON organizations';
    EXECUTE 'CREATE POLICY "Platform admins can manage organizations"
               ON organizations FOR ALL
               USING (public.is_platform_admin(auth.uid()))
               WITH CHECK (public.is_platform_admin(auth.uid()))';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_organizations') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Platform admins can read all memberships" ON user_organizations';
    EXECUTE 'CREATE POLICY "Platform admins can read all memberships"
               ON user_organizations FOR SELECT
               USING (public.is_platform_admin(auth.uid()))';

    EXECUTE 'DROP POLICY IF EXISTS "Platform admins can manage all memberships" ON user_organizations';
    EXECUTE 'CREATE POLICY "Platform admins can manage all memberships"
               ON user_organizations FOR ALL
               USING (public.is_platform_admin(auth.uid()))
               WITH CHECK (public.is_platform_admin(auth.uid()))';
  END IF;
END
$$;
