-- Migration: 20261021120000_create_editorial_collections.sql
-- Description: Create editorial collections, slides/sections, and product junction tables with Row Level Security (RLS).

-- 1. Create Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  cover_image_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Travel' CHECK (category IN ('Travel', 'Beauty & Personal Care', 'Electronics & Tech Accessories')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create Editorial Sections / Slides Table
CREATE TABLE IF NOT EXISTS public.collection_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  heading text NOT NULL,
  body text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  section_type text NOT NULL DEFAULT 'narrative' CHECK (section_type IN ('narrative', 'spotlight', 'comparison', 'checklist', 'takeaway')),
  sort_order integer NOT NULL DEFAULT 0,
  cta_text text,
  cta_destination text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create Collection-Product Association Table (Zero Product Duplication)
CREATE TABLE IF NOT EXISTS public.collection_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  editorial_note text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_collection_product UNIQUE (collection_id, product_id)
);

-- 4. Create Performance and Ordering Indexes
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_status_sort_order ON public.collections(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_collections_category ON public.collections(category);
CREATE INDEX IF NOT EXISTS idx_collection_sections_collection_sort ON public.collection_sections(collection_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_collection_products_collection_sort ON public.collection_products(collection_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_collection_products_product_id ON public.collection_products(product_id);

-- 5. Row Level Security Configuration
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- collections Policies
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Public can view published collections" ON public.collections;
DROP POLICY IF EXISTS "Admins can view all collections" ON public.collections;
DROP POLICY IF EXISTS "Admins can insert collections" ON public.collections;
DROP POLICY IF EXISTS "Admins can update collections" ON public.collections;
DROP POLICY IF EXISTS "Admins can delete collections" ON public.collections;

-- Public can read only published collections
CREATE POLICY "Public can view published collections"
  ON public.collections
  FOR SELECT
  USING (status = 'published');

-- Admins can read all collections (draft, published, archived)
CREATE POLICY "Admins can view all collections"
  ON public.collections
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Only admins can mutate collections
CREATE POLICY "Admins can insert collections"
  ON public.collections
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update collections"
  ON public.collections
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete collections"
  ON public.collections
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------
-- collection_sections Policies
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Public can view published collection sections" ON public.collection_sections;
DROP POLICY IF EXISTS "Admins can view all collection sections" ON public.collection_sections;
DROP POLICY IF EXISTS "Admins can insert collection sections" ON public.collection_sections;
DROP POLICY IF EXISTS "Admins can update collection sections" ON public.collection_sections;
DROP POLICY IF EXISTS "Admins can delete collection sections" ON public.collection_sections;

-- Public can read sections belonging to published collections
CREATE POLICY "Public can view published collection sections"
  ON public.collection_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_sections.collection_id
        AND c.status = 'published'
    )
  );

-- Admins can read all sections
CREATE POLICY "Admins can view all collection sections"
  ON public.collection_sections
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Only admins can mutate sections
CREATE POLICY "Admins can insert collection sections"
  ON public.collection_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update collection sections"
  ON public.collection_sections
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete collection sections"
  ON public.collection_sections
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------
-- collection_products Policies
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Public can view published collection products" ON public.collection_products;
DROP POLICY IF EXISTS "Admins can view all collection products" ON public.collection_products;
DROP POLICY IF EXISTS "Admins can insert collection products" ON public.collection_products;
DROP POLICY IF EXISTS "Admins can update collection products" ON public.collection_products;
DROP POLICY IF EXISTS "Admins can delete collection products" ON public.collection_products;

-- Public can read product associations belonging to published collections
CREATE POLICY "Public can view published collection products"
  ON public.collection_products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_products.collection_id
        AND c.status = 'published'
    )
  );

-- Admins can read all collection products
CREATE POLICY "Admins can view all collection products"
  ON public.collection_products
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Only admins can mutate collection-product associations
CREATE POLICY "Admins can insert collection products"
  ON public.collection_products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update collection products"
  ON public.collection_products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete collection products"
  ON public.collection_products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 6. Explicit Role Grants
GRANT SELECT ON public.collections TO anon;
GRANT SELECT ON public.collection_sections TO anon;
GRANT SELECT ON public.collection_products TO anon;

REVOKE INSERT, UPDATE, DELETE ON public.collections FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.collection_sections FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.collection_products FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_sections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_products TO authenticated;
