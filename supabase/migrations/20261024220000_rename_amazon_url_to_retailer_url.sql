-- Migration: 20261024220000_rename_amazon_url_to_retailer_url.sql
-- Description: Rename amazon_url to retailer_url on products, add retailer_domain for tracking, and backfill domains.

-- 1. Rename amazon_url to retailer_url safely
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'amazon_url'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN amazon_url TO retailer_url;
  END IF;
END $$;

-- 2. Add retailer_domain column for tracking (extract domain from URL)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retailer_domain text DEFAULT 'unknown';

-- 3. Update existing rows with domain extraction
UPDATE public.products 
SET retailer_domain = CASE 
  WHEN retailer_url LIKE '%amazon%' THEN 'amazon.com'
  WHEN retailer_url LIKE '%flipkart%' THEN 'flipkart.com'
  WHEN retailer_url LIKE '%snapdeal%' THEN 'snapdeal.com'
  ELSE 'other'
END
WHERE retailer_domain IS NULL OR retailer_domain = 'unknown';
