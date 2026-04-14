-- Add admin-level RLS policies to existing tables
-- Sprint 3 Week 1: Allows admins to manage all platform data
-- Run this AFTER create-user-roles.sql

-- ============================================================
-- SCENARIOS: Admins can fully manage scenarios
-- ============================================================

-- Admin can read all scenarios (including inactive)
CREATE POLICY "Admins can read all scenarios"
  ON scenarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can insert new scenarios
CREATE POLICY "Admins can insert scenarios"
  ON scenarios FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update scenarios
CREATE POLICY "Admins can update scenarios"
  ON scenarios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can delete scenarios
CREATE POLICY "Admins can delete scenarios"
  ON scenarios FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- USER_PROGRESS: Admins can read all user progress
-- ============================================================

CREATE POLICY "Admins can read all progress"
  ON user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- FEEDBACK: Admins can read all feedback
-- ============================================================

CREATE POLICY "Admins can read all feedback"
  ON feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
