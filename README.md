# Brutalist Amazon Affiliate Storefront

A high-contrast, minimalist Amazon Affiliate storefront and inventory management system built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## ⚡ Key Highlights & Architecture

- **Next.js 14 Server Actions Backend**: Database insertions, deletions, and click tracking execute on the secure Node.js server backend (`app/secure-admin-panel/actions.ts`), completely bypassing client-side browser extensions, Brave Shields, and sandbox iframe restrictions.
- **Dynamic Supabase Integration**: Real-time product inventory storage with fallback to curated static data in `data/products.ts` if the database is empty or initial connection is pending.
- **Curated High-Converting Catalog**:
  - Pricing formatted in INR (₹)
  - Star ratings & review counts
  - Curated category badges (e.g. *Best Value*, *Editor's Pick*, *Top Rated*)
  - The Anti-Regret Matrix (Pros vs. Cons)
  - Direct Amazon Affiliate redirect with silent background click analytics
  - Performance, Value, and Durability benchmark scores
- **Unauthenticated Admin Panel** (`/secure-admin-panel`): Instant form for publishing and deleting products with live feedback.
- **Brutalist / Minimalist Aesthetic**: High-contrast 2px hard borders, offset drop shadows (`shadow-hard`), zero border radius, and typography powered by `Space Grotesk`, `Inter`, and `JetBrains Mono`.

---

## 📁 Project Structure

```
├── app/
│   ├── actions.ts                        # Re-exported server actions for DB operations
│   ├── globals.css                       # Brutalist design system, hard shadows & animations
│   ├── layout.tsx                        # Global root layout, font definitions & Navbar
│   ├── page.tsx                          # Storefront home (category filters, search & grid)
│   ├── product/[id]/
│   │   └── page.tsx                      # Dynamic product review & Anti-Regret Matrix page
│   └── secure-admin-panel/
│       ├── actions.ts                    # Server Actions for Supabase (post, delete, fetch, clicks)
│       └── page.tsx                      # Dedicated Admin Control Panel
├── components/
│   ├── admin/
│   │   ├── AddProductForm.tsx            # Form with badges, qualitative Anti-Regret matrix, strengths & trade-offs
│   │   ├── ProductManager.tsx            # Live inventory list with delete action & links
│   │   └── Toast.tsx                     # Brutalist notification banner
│   ├── Navbar.tsx                        # Header navigation & quick admin links
│   ├── ProductCard.tsx                   # Brutalist product card with qualitative assessment & affiliate CTA
│   └── ReviewDetails.tsx                 # Detailed breakdown, video embed & Anti-Regret Matrix
├── data/
│   └── products.ts                       # Fallback curated product catalog
├── supabase/
│   └── schema.sql                        # PostgreSQL table schemas (products & clicks) + RLS policies
└── utils/supabase/
    ├── client.ts                         # Browser Supabase client with safe env fallbacks
    ├── server.ts                         # Server-side Supabase client (@supabase/ssr)
    └── types.ts                          # TypeScript types for products & new submissions
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js 18.17+ or 20+
- npm, yarn, or pnpm

### 2. Installation
```bash
git clone <repo-url>
cd smartchoice-storefront
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Database Setup (Supabase)
Run the SQL queries in `supabase/schema.sql` inside your **Supabase SQL Editor** to create the `products` and `clicks` tables with Row Level Security (RLS) policies.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/secure-admin-panel](http://localhost:3000/secure-admin-panel) to manage inventory.

---

## 🌐 Deploying to Production (Vercel)

1. Push your repository to GitHub / GitLab.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. Next.js Server Actions and Supabase will connect natively in production.
