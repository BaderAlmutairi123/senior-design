-- Create user_roles table for role-based access control
-- Sprint 3 Week 1: Admin role setup
-- Run this in the Supabase SQL Editor

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. SECURITY DEFINER helper so RLS policies that need to check admin status
--    can do so without recursing back into user_roles' own policies.
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

-- 4. RLS Policies

-- Users can read their own role
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all roles (uses SECURITY DEFINER helper → no recursion)
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;
CREATE POLICY "Admins can read all roles"
  ON user_roles FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

-- Admins can insert/update/delete roles
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- 5. Auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Backfill: assign 'user' role to any existing users who don't have one
INSERT INTO user_roles (user_id, role)
SELECT id, 'user' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- 7. To promote a user to admin, run:
-- UPDATE user_roles SET role = 'admin' WHERE user_id = '<USER_UUID>';
