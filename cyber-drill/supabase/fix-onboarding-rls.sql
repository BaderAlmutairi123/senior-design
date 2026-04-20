-- ─────────────────────────────────────────────────────────────────────────
-- Fix: onboarding RLS silently drops updates
--
-- During signup onboarding a user needs to:
--   - standalone: mark themselves onboarded
--   - member:     redeem invite + add themselves to org + mark onboarded
--   - org admin:  create an org + become its owner (stays role='user')
--
-- Plain UPDATE/INSERT statements against user_roles / organizations /
-- user_organizations get filtered out by RLS (no "user can upgrade
-- themselves" policy exists, and shouldn't — it would be a privilege
-- escalation). Supabase returns success with 0 rows changed, so the
-- app thinks it worked, then the next step fails with a RLS violation.
--
-- Fix: do each flow in a single SECURITY DEFINER function. Each function
-- checks the caller is authenticated and not already onboarded, then
-- performs all the writes with RLS bypassed.
--
-- Idempotent. Run after create-onboarding.sql.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Standalone onboarding
CREATE OR REPLACE FUNCTION public.onboard_standalone()
RETURNS VOID
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

  UPDATE public.user_roles
    SET onboarded = true
    WHERE user_id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.onboard_standalone() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.onboard_standalone() TO authenticated;

-- 2. Org member onboarding: redeem invite + join + mark onboarded
CREATE OR REPLACE FUNCTION public.onboard_as_org_member(invite_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_org_id UUID;
  v_already_member BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Redeem invite via existing helper (also increments use count)
  v_org_id := public.redeem_invite_code(invite_code);
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.user_organizations
    WHERE user_id = v_uid AND organization_id = v_org_id
  ) INTO v_already_member;

  IF NOT v_already_member THEN
    INSERT INTO public.user_organizations (user_id, organization_id, role)
      VALUES (v_uid, v_org_id, 'member');
  END IF;

  UPDATE public.user_roles
    SET onboarded = true
    WHERE user_id = v_uid;

  RETURN v_org_id;
END;
$$;

REVOKE ALL ON FUNCTION public.onboard_as_org_member(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.onboard_as_org_member(TEXT) TO authenticated;

-- 3. Org admin onboarding: create org + become its owner.
--    The user stays role='user' in user_roles — they are NOT a platform
--    admin.  Their admin powers come from being the org owner in
--    user_organizations.
CREATE OR REPLACE FUNCTION public.onboard_as_admin(org_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_already_onboarded BOOLEAN;
  v_base_slug TEXT;
  v_slug TEXT;
  v_suffix INT := 1;
  v_exists BOOLEAN;
  v_org_id UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF org_name IS NULL OR length(trim(org_name)) = 0 THEN
    RAISE EXCEPTION 'Organization name is required';
  END IF;

  SELECT onboarded INTO v_already_onboarded
    FROM public.user_roles WHERE user_id = v_uid;
  IF v_already_onboarded THEN
    RAISE EXCEPTION 'Already onboarded';
  END IF;

  -- Mark onboarded only — do NOT set role='admin'
  UPDATE public.user_roles
    SET onboarded = true
    WHERE user_id = v_uid;

  -- Build unique slug
  v_base_slug := lower(regexp_replace(trim(org_name), '[^a-zA-Z0-9 -]', '', 'g'));
  v_base_slug := regexp_replace(v_base_slug, '\s+', '-', 'g');
  v_base_slug := regexp_replace(v_base_slug, '-+', '-', 'g');
  v_base_slug := left(v_base_slug, 64);
  IF v_base_slug = '' OR v_base_slug IS NULL THEN
    v_base_slug := 'org';
  END IF;
  v_slug := v_base_slug;

  WHILE v_suffix < 100 LOOP
    SELECT EXISTS(SELECT 1 FROM public.organizations WHERE slug = v_slug)
      INTO v_exists;
    EXIT WHEN NOT v_exists;
    v_suffix := v_suffix + 1;
    v_slug := v_base_slug || '-' || v_suffix;
  END LOOP;

  -- Create org
  INSERT INTO public.organizations (name, slug, created_by)
    VALUES (trim(org_name), v_slug, v_uid)
    RETURNING id INTO v_org_id;

  -- Add creator as org owner
  INSERT INTO public.user_organizations (user_id, organization_id, role)
    VALUES (v_uid, v_org_id, 'owner');

  RETURN v_org_id;
END;
$$;

REVOKE ALL ON FUNCTION public.onboard_as_admin(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.onboard_as_admin(TEXT) TO authenticated;
