-- Migration: 20261025003000_add_youtube_url_to_products.sql
-- Description: Add nullable youtube_url column to public.products safely and idempotently.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS youtube_url text;
