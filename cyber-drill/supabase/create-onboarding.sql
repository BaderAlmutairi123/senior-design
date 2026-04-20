-- ─────────────────────────────────────────────────────────────────────────
-- Onboarding support: invite codes + onboarded flag
-- Run AFTER create-user-roles.sql and create-organizations.sql
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Add onboarded flag to user_roles
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN NOT NULL DEFAULT false;

-- 2. Mark all existing users as already onboarded (they predate this flow)
UPDATE user_roles SET onboarded = true WHERE onboarded = false;

-- 3. Organization invite codes
CREATE TABLE IF NOT EXISTS organization_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  max_uses INT DEFAULT 0,
  uses INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_invites_code ON organization_invites(code);
CREATE INDEX IF NOT EXISTS idx_org_invites_org ON organization_invites(organization_id);

ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- Anyone can look up an invite code (needed during onboarding before role exists)
DROP POLICY IF EXISTS "Anyone can read active invite codes" ON organization_invites;
CREATE POLICY "Anyone can read active invite codes"
  ON organization_invites FOR SELECT
  USING (is_active = true);

-- Platform admins can manage all invite codes
DROP POLICY IF EXISTS "Platform admins can manage invites" ON organization_invites;
CREATE POLICY "Platform admins can manage invites"
  ON organization_invites FOR ALL
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Org owners/admins can manage their org's invite codes
DROP POLICY IF EXISTS "Org owners and admins can manage invites" ON organization_invites;
CREATE POLICY "Org owners and admins can manage invites"
  ON organization_invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = organization_invites.organization_id
        AND uo.user_id = auth.uid()
        AND uo.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = organization_invites.organization_id
        AND uo.user_id = auth.uid()
        AND uo.role IN ('owner', 'admin')
    )
  );

-- 4. SECURITY DEFINER helper to validate and consume an invite code.
--    Returns the organization_id if valid, NULL otherwise.
CREATE OR REPLACE FUNCTION public.redeem_invite_code(invite_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
BEGIN
  SELECT * FROM public.organization_invites
    WHERE code = invite_code AND is_active = true
    INTO v_invite;

  IF v_invite IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check expiry
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
    RETURN NULL;
  END IF;

  -- Check max uses
  IF v_invite.max_uses > 0 AND v_invite.uses >= v_invite.max_uses THEN
    RETURN NULL;
  END IF;

  -- Increment uses
  UPDATE public.organization_invites SET uses = uses + 1 WHERE id = v_invite.id;

  RETURN v_invite.organization_id;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_invite_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_invite_code(TEXT) TO authenticated;
