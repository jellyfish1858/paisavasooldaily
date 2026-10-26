import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  assignProductsToCollections,
  sortBestValueProducts,
  COLLECTIONS,
  type CollectionId,
} from '@/lib/collection-utils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const collectionId = id as CollectionId;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const { data: products, error } = await supabase.from('products').select('*');

    if (error || !products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    const assignments = assignProductsToCollections(products as any[]);
    let collectionProducts = products.filter(p => assignments.get(p.id)?.includes(collectionId));

    // Sort "Best Value" collection by click count (descending) first, then price as tiebreaker
    if (collectionId === 'best-value') {
      const clickMap = new Map<string, number>();
      try {
        const { data: clickRows } = await supabase
          .from('affiliate_clicks')
          .select('product_id');

        if (clickRows && Array.isArray(clickRows)) {
          clickRows.forEach((row: any) => {
            if (row.product_id) {
              clickMap.set(row.product_id, (clickMap.get(row.product_id) || 0) + 1);
            }
          });
        }
      } catch (clickErr) {
        console.warn('affiliate_clicks query note for best-value sorting:', clickErr);
      }

      collectionProducts = sortBestValueProducts(collectionProducts as any[], clickMap);
    }

    const collection = COLLECTIONS.find(c => c.id === collectionId);

    return NextResponse.json({
      id: collectionId,
      name: collection?.name,
      description: collection?.description,
      icon: collection?.icon,
      products: collectionProducts,
      count: collectionProducts.length,
    });
  } catch (error) {
    console.error(`Failed to fetch collection ${collectionId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}
