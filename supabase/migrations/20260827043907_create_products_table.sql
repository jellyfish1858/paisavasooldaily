CREATE TABLE IF NOT EXISTS public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  image_url text not null default '',
  video_url text not null default '',
  amazon_url text not null default '',
  verdict text not null default '',
  reasons_to_buy jsonb not null default '[]'::jsonb,
  reasons_not_to_buy jsonb not null default '[]'::jsonb,
  performance_score int not null check (performance_score between 0 and 100),
  value_score int not null check (value_score between 0 and 100),
  durability_score int not null check (durability_score between 0 and 100),
  created_at timestamptz not null default now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products"
  ON public.products
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can insert products" ON public.products;
CREATE POLICY "Authenticated can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can delete products" ON public.products;
CREATE POLICY "Authenticated can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (true);