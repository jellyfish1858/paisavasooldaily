/*
# Create products table for storefront admin panel

1. New Tables
- `products` — stores product listings shown in the storefront.
  - `id` (uuid, primary key, auto-generated)
  - `title` (text, not null)
  - `description` (text, not null)
  - `category` (text, not null)
  - `image_url` (text, defaults to empty string)
  - `video_url` (text, defaults to empty string)
  - `amazon_url` (text, defaults to empty string)
  - `verdict` (text, defaults to empty string)
  - `reasons_to_buy` (jsonb array, defaults to empty array)
  - `reasons_not_to_buy` (jsonb array, defaults to empty array)
  - `performance_score` (int 0-100, not null)
  - `value_score` (int 0-100, not null)
  - `durability_score` (int 0-100, not null)
  - `created_at` (timestamptz, defaults to now)

2. Security
- Enable RLS on `products`.
- Public (anon) read access — the storefront needs to display products to all visitors.
- Authenticated-only insert and delete — only logged-in admin users can add or remove products.
*/