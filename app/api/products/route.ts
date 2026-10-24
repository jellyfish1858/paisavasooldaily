import { NextResponse } from "next/server";
import { fetchProductsAction } from "@/app/secure-admin-panel/actions";
import type { DbProduct } from "@/utils/supabase/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const categoryParam = searchParams.get("category");

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    const res = await fetchProductsAction();
    if (!res.success || !Array.isArray(res.data)) {
      return NextResponse.json([], { status: 200 });
    }

    let products: DbProduct[] = res.data;

    if (categoryParam && categoryParam !== "ALL") {
      products = products.filter(
        (p) => p.category?.toLowerCase() === categoryParam.toLowerCase()
      );
    }

    if (offset > 0) {
      products = products.slice(offset);
    }

    if (limit && limit > 0) {
      products = products.slice(0, limit);
    }

    return NextResponse.json(products, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("API /api/products exception:", error);
    return NextResponse.json([], { status: 500 });
  }
}
