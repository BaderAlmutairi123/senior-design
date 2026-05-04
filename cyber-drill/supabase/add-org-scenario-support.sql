-- ─────────────────────────────────────────────────────────────────────────
-- Org scenario support
--
-- 1. Add organization_id column to scenarios so org-created scenarios
--    can be scoped to an organization.
-- 2. SECURITY DEFINER function so org owners/admins can create scenarios
--    without needing platform-level INSERT privileges on the scenarios table.
--
-- Run after fix-user-organizations-recursion.sql (needs is_org_manager).
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_scenarios_org ON scenarios(organization_id);

-- Org owners/admins can create scenarios for their org.
CREATE OR REPLACE FUNCTION public.create_org_scenario(
  p_org_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_scenario_type TEXT,
  p_difficulty TEXT,
  p_points INT,
  p_time_limit INT,
  p_content JSONB,
  p_correct_answers JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_scenario_id UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_org_manager(v_uid, p_org_id) THEN
    RAISE EXCEPTION 'Forbidden: not an owner or admin of this organization';
  END IF;

  INSERT INTO public.scenarios (
    title, description, scenario_type, difficulty, points,
    time_limit_seconds, content, correct_answers, is_active, organization_id
  ) VALUES (
    p_title, p_description, p_scenario_type, p_difficulty, p_points,
    p_time_limit, p_content, p_correct_answers, true, p_org_id
  ) RETURNING id INTO v_scenario_id;

  INSERT INTO public.organization_scenarios (organization_id, scenario_id, assigned_by)
    VALUES (p_org_id, v_scenario_id, v_uid);

  RETURN v_scenario_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_org_scenario(UUID, TEXT, TEXT, TEXT, TEXT, INT, INT, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_org_scenario(UUID, TEXT, TEXT, TEXT, TEXT, INT, INT, JSONB, JSONB) TO authenticated;

-- Org owners/admins can delete scenarios they created for their org.
CREATE OR REPLACE FUNCTION public.delete_org_scenario(p_org_id UUID, p_scenario_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_org_manager(v_uid, p_org_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  DELETE FROM public.scenarios
    WHERE id = p_scenario_id AND organization_id = p_org_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_org_scenario(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_org_scenario(UUID, UUID) TO authenticated;
