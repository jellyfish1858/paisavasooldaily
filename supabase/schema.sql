-- Run this in the Supabase SQL editor to initialize or update your database.

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text,
  description text NOT NULL,
  category text NOT NULL,
  badge text DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  video_url text DEFAULT '',
  retailer_url text NOT NULL DEFAULT '',
  retailer_domain text DEFAULT 'unknown',

  -- Content
  quick_take text DEFAULT '',
  key_specs jsonb DEFAULT '[]'::jsonb,
  strengths jsonb DEFAULT '[]'::jsonb,
  trade_offs jsonb DEFAULT '[]'::jsonb,
  good_for jsonb DEFAULT '[]'::jsonb,
  skip_if jsonb DEFAULT '[]'::jsonb,
  what_to_check jsonb DEFAULT '[]'::jsonb,
  final_take text DEFAULT '',

  -- Anti-Regret Matrix (Qualitative only: Strong, Good, Fair, Depends, Limited)
  matrix_performance text CHECK (matrix_performance IS NULL OR matrix_performance IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited')),
  matrix_value text CHECK (matrix_value IS NULL OR matrix_value IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited')),
  matrix_ease_of_use text CHECK (matrix_ease_of_use IS NULL OR matrix_ease_of_use IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited')),
  matrix_portability text CHECK (matrix_portability IS NULL OR matrix_portability IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited')),
  matrix_compatibility text CHECK (matrix_compatibility IS NULL OR matrix_compatibility IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited')),
  matrix_long_term_suitability text CHECK (matrix_long_term_suitability IS NULL OR matrix_long_term_suitability IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited')),

  -- Research
  research_basis text,
  research_sources jsonb DEFAULT '[]'::jsonb,
  last_reviewed_at timestamptz,

  -- Operational
  is_out_of_stock boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add any missing columns to existing table safely
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge text DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quick_take text DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS key_specs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS strengths jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS trade_offs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS good_for jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS skip_if jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS what_to_check jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS final_take text DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_performance text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_value text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_ease_of_use text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_portability text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_compatibility text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_long_term_suitability text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS research_basis text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS research_sources jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS last_reviewed_at timestamptz;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_out_of_stock boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retailer_url text DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retailer_domain text DEFAULT 'unknown';

-- Drop obsolete rating and scoring columns if they still exist
ALTER TABLE public.products DROP COLUMN IF EXISTS rating;
ALTER TABLE public.products DROP COLUMN IF EXISTS reviews_count;
ALTER TABLE public.products DROP COLUMN IF EXISTS performance_score;
ALTER TABLE public.products DROP COLUMN IF EXISTS value_score;
ALTER TABLE public.products DROP COLUMN IF EXISTS durability_score;

-- 2. Create Clicks Analytics Table
CREATE TABLE IF NOT EXISTS public.clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  count int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create Admin Users Authorization Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- 4. Create Helper Function to Check Admin Role Safely
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

-- 5. Row Level Security Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin Users Policies:
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

-- Products Policies:
DROP POLICY IF EXISTS "Public can read products" ON public.products;
DROP POLICY IF EXISTS "Allow product inserts" ON public.products;
DROP POLICY IF EXISTS "Allow product updates" ON public.products;
DROP POLICY IF EXISTS "Allow product deletes" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Public can read products"
  ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Clicks Policies:
DROP POLICY IF EXISTS "Allow clicks insert" ON public.clicks;
DROP POLICY IF EXISTS "Allow clicks select" ON public.clicks;
DROP POLICY IF EXISTS "Allow clicks update" ON public.clicks;
DROP POLICY IF EXISTS "Public can record clicks" ON public.clicks;
DROP POLICY IF EXISTS "Admins can view clicks" ON public.clicks;
DROP POLICY IF EXISTS "Admins can delete clicks" ON public.clicks;

CREATE POLICY "Public can record clicks"
  ON public.clicks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view clicks"
  ON public.clicks
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete clicks"
  ON public.clicks
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 6. Role Grants
GRANT SELECT ON public.products TO anon;
GRANT INSERT ON public.clicks TO anon;
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon;
REVOKE SELECT, UPDATE, DELETE ON public.clicks FROM anon;
REVOKE ALL ON public.admin_users FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.clicks TO authenticated;
REVOKE UPDATE ON public.clicks FROM authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
