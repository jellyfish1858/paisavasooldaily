import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assignProductsToCollections, COLLECTIONS, type CollectionId } from '@/lib/collection-utils';

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
    const collectionProducts = products.filter(p => assignments.get(p.id)?.includes(collectionId));

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
