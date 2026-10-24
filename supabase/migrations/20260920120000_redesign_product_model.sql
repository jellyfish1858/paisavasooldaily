-- Migration: 20260920120000_redesign_product_model.sql
-- Description: Transition products table to canonical qualitative research model and remove obsolete ratings & scores.

-- 1. Add new Identity & Content fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quick_take text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS key_specs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS strengths jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS trade_offs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS good_for jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS skip_if jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS what_to_check jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS final_take text DEFAULT '';

-- 2. Add Qualitative Anti-Regret Matrix fields (strictly qualitative values or NULL)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_performance text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_value text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_ease_of_use text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_portability text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_compatibility text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS matrix_long_term_suitability text;

-- Constraints for allowed qualitative matrix values: 'Strong', 'Good', 'Fair', 'Depends', 'Limited'
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_matrix_performance;
ALTER TABLE public.products ADD CONSTRAINT check_matrix_performance
  CHECK (matrix_performance IS NULL OR matrix_performance IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited'));

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_matrix_value;
ALTER TABLE public.products ADD CONSTRAINT check_matrix_value
  CHECK (matrix_value IS NULL OR matrix_value IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited'));

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_matrix_ease_of_use;
ALTER TABLE public.products ADD CONSTRAINT check_matrix_ease_of_use
  CHECK (matrix_ease_of_use IS NULL OR matrix_ease_of_use IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited'));

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_matrix_portability;
ALTER TABLE public.products ADD CONSTRAINT check_matrix_portability
  CHECK (matrix_portability IS NULL OR matrix_portability IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited'));

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_matrix_compatibility;
ALTER TABLE public.products ADD CONSTRAINT check_matrix_compatibility
  CHECK (matrix_compatibility IS NULL OR matrix_compatibility IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited'));

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_matrix_long_term_suitability;
ALTER TABLE public.products ADD CONSTRAINT check_matrix_long_term_suitability
  CHECK (matrix_long_term_suitability IS NULL OR matrix_long_term_suitability IN ('Strong', 'Good', 'Fair', 'Depends', 'Limited'));

-- 3. Add Research fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS research_basis text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS research_sources jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS last_reviewed_at timestamptz;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 4. Data Migration: Preserve existing editorial content into new fields safely
UPDATE public.products
SET
  strengths = CASE
    WHEN strengths IS NULL OR strengths = '[]'::jsonb THEN
      COALESCE(NULLIF(pros, '[]'::jsonb), NULLIF(reasons_to_buy, '[]'::jsonb), '[]'::jsonb)
    ELSE strengths
  END,
  trade_offs = CASE
    WHEN trade_offs IS NULL OR trade_offs = '[]'::jsonb THEN
      COALESCE(NULLIF(cons, '[]'::jsonb), NULLIF(reasons_not_to_buy, '[]'::jsonb), '[]'::jsonb)
    ELSE trade_offs
  END,
  final_take = CASE
    WHEN final_take IS NULL OR final_take = '' THEN
      COALESCE(NULLIF(verdict, ''), '')
    ELSE final_take
  END
WHERE id IS NOT NULL;

-- 5. Drop obsolete rating and score columns
ALTER TABLE public.products DROP COLUMN IF EXISTS rating;
ALTER TABLE public.products DROP COLUMN IF EXISTS reviews_count;
ALTER TABLE public.products DROP COLUMN IF EXISTS performance_score;
ALTER TABLE public.products DROP COLUMN IF EXISTS value_score;
ALTER TABLE public.products DROP COLUMN IF EXISTS durability_score;
