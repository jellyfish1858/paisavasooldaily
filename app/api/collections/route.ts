import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assignProductsToCollections } from '@/lib/collection-assignment';
import type { Product } from '@/data/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const { data: products, error } = await supabase.from('products').select('*');

    if (error) {
      console.warn('Supabase products fetch warning in collections API:', error.message);
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ collections: {} });
    }

    const assignments = assignProductsToCollections(products as Product[]);

    const collections = {
      'best-value': products.filter((p: any) => assignments.get(p.id)?.includes('best-value')),
      'premium-picks': products.filter((p: any) => assignments.get(p.id)?.includes('premium-picks')),
      'everyday-essentials': products.filter((p: any) =>
        assignments.get(p.id)?.includes('everyday-essentials')
      ),
      'trending-now': products.filter((p: any) => assignments.get(p.id)?.includes('trending-now')),
      'smart-buys': products.filter((p: any) => assignments.get(p.id)?.includes('smart-buys')),
    };

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
