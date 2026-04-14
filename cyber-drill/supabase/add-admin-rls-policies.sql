-- Add admin-level RLS policies to existing tables
-- Sprint 3 Week 1: Allows admins to manage all platform data
-- Run this AFTER create-user-roles.sql
--
-- All policies use public.is_platform_admin(uid) — a SECURITY DEFINER helper
-- defined in create-user-roles.sql — to avoid recursive RLS lookups on
-- user_roles.

-- ============================================================
-- SCENARIOS: Admins can fully manage scenarios
-- ============================================================

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

-- ============================================================
-- USER_PROGRESS: Admins can read all user progress
-- ============================================================

DROP POLICY IF EXISTS "Admins can read all progress" ON user_progress;
CREATE POLICY "Admins can read all progress"
  ON user_progress FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

-- ============================================================
-- FEEDBACK: Admins can read all feedback
-- ============================================================

DROP POLICY IF EXISTS "Admins can read all feedback" ON feedback;
CREATE POLICY "Admins can read all feedback"
  ON feedback FOR SELECT
  USING (public.is_platform_admin(auth.uid()));
