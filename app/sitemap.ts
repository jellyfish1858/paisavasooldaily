import { MetadataRoute } from "next";
import { products } from "@/data/products";
import { getStoredProducts } from "@/utils/storage";
import {
  fetchProductsAction,
  fetchPublishedCollectionsAction,
} from "@/app/secure-admin-panel/actions";
import { getAllCategories } from "@/data/categories";
import { getAllGuides } from "@/data/guides";
import { getSiteUrl } from "@/config/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  // 1. Gather unique product slugs from database, local storage, and static array
  const productMap = new Map<string, { slug: string; lastModified?: Date }>();

  products.forEach((p) => {
    const slug = p.slug || p.id;
    if (slug) {
      const date = p.last_reviewed_at || p.updated_at || p.created_at;
      productMap.set(slug, {
        slug,
        lastModified: date ? new Date(date) : undefined,
      });
    }
  });

  try {
    const stored = getStoredProducts();
    if (stored && Array.isArray(stored)) {
      stored.forEach((p) => {
        const slug = p.slug || p.id;
        if (slug) {
          const date = p.last_reviewed_at || p.updated_at || p.created_at;
          productMap.set(slug, {
            slug,
            lastModified: date ? new Date(date) : undefined,
          });
        }
      });
    }
  } catch {
    // fallback to static products
  }

  try {
    const res = await fetchProductsAction();
    if (res && res.success && Array.isArray(res.data)) {
      res.data.forEach((p) => {
        const slug = p.slug || p.id;
        if (slug) {
          const date = p.last_reviewed_at || p.updated_at || p.created_at;
          productMap.set(slug, {
            slug,
            lastModified: date ? new Date(date) : undefined,
          });
        }
      });
    }
  } catch (err) {
    console.error("Error fetching dynamic products for sitemap:", err);
  }

  const productUrls: MetadataRoute.Sitemap = Array.from(productMap.values()).map(
    (item) => {
      const isValidDate =
        item.lastModified instanceof Date && !isNaN(item.lastModified.getTime());
      return {
        url: `${baseUrl}/product/${encodeURIComponent(item.slug.trim())}`,
        ...(isValidDate ? { lastModified: item.lastModified } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      };
    }
  );

  // 2. Category Pages
  const categories = getAllCategories();
  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // 3. Buying Guides
  const guides = getAllGuides();
  const guideUrls: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.lastUpdated),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // 4. Built-in Collections (5 Core Collections)
  const builtInCollectionUrls: MetadataRoute.Sitemap = [
    "best-value",
    "premium-picks",
    "everyday-essentials",
    "trending-now",
    "smart-buys",
  ].map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 5. Published Editorial Collections (Strictly excluding drafts and archived)
  let editorialCollectionUrls: MetadataRoute.Sitemap = [];
  try {
    const colRes = await fetchPublishedCollectionsAction();
    if (colRes && colRes.success && Array.isArray(colRes.data)) {
      editorialCollectionUrls = colRes.data
        .filter((col) => col.status === "published" && col.slug && col.slug.trim())
        .map((col) => {
          const modDate = col.updated_at || col.created_at;
          const parsedDate = modDate ? new Date(modDate) : undefined;
          const isValidDate =
            parsedDate instanceof Date && !isNaN(parsedDate.getTime());
          return {
            url: `${baseUrl}/collections/${encodeURIComponent(col.slug.trim())}`,
            ...(isValidDate ? { lastModified: parsedDate } : {}),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          };
        });
    }
  } catch (err) {
    console.error("Error fetching published collections for sitemap:", err);
  }

  // 6. Combined Indexable Public Pages (strictly excluding admin, API, and query permutations)
  return [
    {
      url: baseUrl,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/category`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...categoryUrls,
    {
      url: `${baseUrl}/guides`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...guideUrls,
    {
      url: `${baseUrl}/collections`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...builtInCollectionUrls,
    ...editorialCollectionUrls,
    {
      url: `${baseUrl}/compare`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    ...productUrls,
  ];
}
