-- Migration: Secure Admin Authentication & Role-Based Row Level Security (RLS)
-- File: supabase/migrations/20260920130000_secure_admin_auth_and_rls.sql
-- Description:
-- 1. Creates public.admin_users table linked to auth.users(id).
-- 2. Creates security definer helper function public.is_admin().
-- 3. Replaces permissive public product mutation policies with strict admin-only policies.
-- 4. Secures public.clicks to allow public INSERTs while restricting SELECT/DELETE to admins.
-- 5. Configures explicit table grants for anon and authenticated roles.

-- 1. Create Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for rapid lookup during RLS policy evaluation
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- 2. Create Security Definer Helper Function
-- Prevents RLS recursion and executes in secure context
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 3. Row Level Security for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
CREATE POLICY "Admins can manage admin_users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Row Level Security for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop legacy/insecure mutation policies
DROP POLICY IF EXISTS "Public can read products" ON public.products;
DROP POLICY IF EXISTS "Allow product inserts" ON public.products;
DROP POLICY IF EXISTS "Allow product updates" ON public.products;
DROP POLICY IF EXISTS "Allow product deletes" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Read policy: Anyone (public and authenticated) can view products
CREATE POLICY "Public can read products"
  ON public.products
  FOR SELECT
  USING (true);

-- Insert policy: Only authenticated admins can add products
CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Update policy: Only authenticated admins can modify products
CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Delete policy: Only authenticated admins can remove products
CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 5. Row Level Security for clicks
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- Drop legacy click policies
DROP POLICY IF EXISTS "Allow clicks insert" ON public.clicks;
DROP POLICY IF EXISTS "Allow clicks select" ON public.clicks;
DROP POLICY IF EXISTS "Allow clicks update" ON public.clicks;
DROP POLICY IF EXISTS "Public can record clicks" ON public.clicks;
DROP POLICY IF EXISTS "Admins can view clicks" ON public.clicks;
DROP POLICY IF EXISTS "Admins can delete clicks" ON public.clicks;

-- Insert policy: Anyone can record an affiliate click
CREATE POLICY "Public can record clicks"
  ON public.clicks
  FOR INSERT
  WITH CHECK (true);

-- Select policy: Only authenticated admins can view analytics/click logs
CREATE POLICY "Admins can view clicks"
  ON public.clicks
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Delete policy: Only authenticated admins can delete click logs
CREATE POLICY "Admins can delete clicks"
  ON public.clicks
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 6. Explicit Role Grants
-- Anonymous visitors:
GRANT SELECT ON public.products TO anon;
GRANT INSERT ON public.clicks TO anon;
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon;
REVOKE SELECT, UPDATE, DELETE ON public.clicks FROM anon;
REVOKE ALL ON public.admin_users FROM anon;

-- Authenticated users (RLS further restricts mutations to admins):
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.clicks TO authenticated;
REVOKE UPDATE ON public.clicks FROM authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
