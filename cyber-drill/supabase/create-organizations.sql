-- ─────────────────────────────────────────────────────────────────────────
-- Organizations & user-organization memberships
-- Enables multi-tenant usage of CyberDrill (e.g., a company deploys the
-- platform for its employees).
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(organization_id);

-- Keep updated_at fresh on organizations
CREATE OR REPLACE FUNCTION public.touch_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_organizations_updated_at ON organizations;
CREATE TRIGGER trg_touch_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_organizations_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Row-Level Security
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Organizations: a member can read orgs they belong to.
DROP POLICY IF EXISTS "Members can read their organizations" ON organizations;
CREATE POLICY "Members can read their organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = organizations.id
        AND uo.user_id = auth.uid()
    )
  );

-- Organizations: platform admins can read all.
DROP POLICY IF EXISTS "Platform admins can read all organizations" ON organizations;
CREATE POLICY "Platform admins can read all organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- Organizations: platform admins can manage all.
DROP POLICY IF EXISTS "Platform admins can manage organizations" ON organizations;
CREATE POLICY "Platform admins can manage organizations"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- Organizations: org owners/admins can update their org.
DROP POLICY IF EXISTS "Org owners and admins can update their org" ON organizations;
CREATE POLICY "Org owners and admins can update their org"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = organizations.id
        AND uo.user_id = auth.uid()
        AND uo.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = organizations.id
        AND uo.user_id = auth.uid()
        AND uo.role IN ('owner', 'admin')
    )
  );

-- user_organizations: a user can see their own memberships.
DROP POLICY IF EXISTS "Users can read their own memberships" ON user_organizations;
CREATE POLICY "Users can read their own memberships"
  ON user_organizations FOR SELECT
  USING (auth.uid() = user_id);

-- user_organizations: members of an org can see other members in the same org.
DROP POLICY IF EXISTS "Members can read co-members" ON user_organizations;
CREATE POLICY "Members can read co-members"
  ON user_organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations my
      WHERE my.organization_id = user_organizations.organization_id
        AND my.user_id = auth.uid()
    )
  );

-- user_organizations: org owners/admins can manage memberships of their org.
DROP POLICY IF EXISTS "Org owners and admins can manage memberships" ON user_organizations;
CREATE POLICY "Org owners and admins can manage memberships"
  ON user_organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations my
      WHERE my.organization_id = user_organizations.organization_id
        AND my.user_id = auth.uid()
        AND my.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations my
      WHERE my.organization_id = user_organizations.organization_id
        AND my.user_id = auth.uid()
        AND my.role IN ('owner', 'admin')
    )
  );

-- user_organizations: platform admins can read/manage all memberships.
DROP POLICY IF EXISTS "Platform admins can read all memberships" ON user_organizations;
CREATE POLICY "Platform admins can read all memberships"
  ON user_organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Platform admins can manage all memberships" ON user_organizations;
CREATE POLICY "Platform admins can manage all memberships"
  ON user_organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );
