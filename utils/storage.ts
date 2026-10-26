import fs from "fs";
import path from "path";
import type { DbProduct, NewDbProduct } from "@/utils/supabase/types";
import { extractRetailerDomain } from "@/config/affiliate";

const PRODUCTS_FILE = path.join(process.cwd(), "data", "products_store.json");
const CLICKS_FILE = path.join(process.cwd(), "data", "clicks_store.json");

function ensureDirectoryExistence(filePath: string) {
  try {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  } catch {
    // Edge runtime / serverless environments may have a virtual or read-only filesystem
  }
}

export function getDefaultProducts(): DbProduct[] {
  return [];
}

export function getStoredProducts(): DbProduct[] {
  try {
    ensureDirectoryExistence(PRODUCTS_FILE);
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2), "utf8");
      return [];
    }
    const content = fs.readFileSync(PRODUCTS_FILE, "utf8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2), "utf8");
      return [];
    }
    return parsed;
  } catch (err) {
    console.error("Error reading stored products:", err);
    return [];
  }
}

export function saveStoredProducts(products: DbProduct[]) {
  try {
    ensureDirectoryExistence(PRODUCTS_FILE);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error saving stored products:", err);
    return false;
  }
}

export function getStoredProductById(id: string): DbProduct | null {
  const products = getStoredProducts();
  return products.find((p) => p.id === id) || null;
}

export function saveStoredProduct(product: NewDbProduct & { id?: string }): DbProduct {
  const products = getStoredProducts();
  const existingId = product.id;

  const generateSlug = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const id =
    existingId ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${generateSlug(product.title || "product")}-${Date.now().toString(36)}`);

  const strengthsList = product.strengths || product.reasons_to_buy || product.pros || [];
  const tradeOffsList = product.trade_offs || product.reasons_not_to_buy || product.cons || [];
  const finalTakeText = product.final_take || product.verdict || "";

  const retailerUrl =
    product.retailer_url ||
    product.amazon_url ||
    (product as any).amazonUrl ||
    (product as any).retailerUrl ||
    "";
  const retailerDomain =
    product.retailer_domain ||
    (product as any).retailerDomain ||
    extractRetailerDomain(retailerUrl);

  const youtubeUrl =
    product.youtube_url ||
    (product as any).youtubeUrl ||
    product.youtube_url ||
    (product as any).videoUrl ||
    undefined;

  const newProduct: DbProduct = {
    ...product,
    id,
    retailer_url: retailerUrl,
    retailer_domain: retailerDomain,
    amazon_url: retailerUrl,
    youtube_url: youtubeUrl,
    slug: product.slug || generateSlug(product.title || "product"),
    created_at: (product as any).created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    strengths: strengthsList,
    trade_offs: tradeOffsList,
    reasons_to_buy: strengthsList,
    reasons_not_to_buy: tradeOffsList,
    pros: strengthsList,
    cons: tradeOffsList,
    final_take: finalTakeText,
    verdict: finalTakeText,
    quick_take: product.quick_take || product.description || "",
    key_specs: product.key_specs || [],
    good_for: product.good_for || [],
    skip_if: product.skip_if || [],
    what_to_check: product.what_to_check || [],
    matrix_performance: product.matrix_performance || null,
    matrix_value: product.matrix_value || null,
    matrix_ease_of_use: product.matrix_ease_of_use || null,
    matrix_portability: product.matrix_portability || null,
    matrix_compatibility: product.matrix_compatibility || null,
    matrix_long_term_suitability: product.matrix_long_term_suitability || null,
    research_basis: product.research_basis || "",
    research_sources: product.research_sources || [],
    last_reviewed_at: product.last_reviewed_at || null,
    is_out_of_stock: Boolean(product.is_out_of_stock),
    clicks_count: product.clicks_count ?? 0,
  };

  const existingIndex = products.findIndex((p) => p.id === id);
  if (existingIndex !== -1) {
    products[existingIndex] = { ...products[existingIndex], ...newProduct };
    saveStoredProducts(products);
    return products[existingIndex];
  }

  const updated = [newProduct, ...products];
  saveStoredProducts(updated);
  return newProduct;
}

export function updateStoredProduct(id: string, productData: Partial<DbProduct>): DbProduct {
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    const defaults = getDefaultProducts();
    const fallback = defaults.find((p) => p.id === id);
    const base: DbProduct = fallback || {
      id,
      title: productData.title || "Untitled Product",
      description: productData.description || "",
      category: productData.category || "Tech",
      badge: productData.badge || "",
      image_url: productData.image_url || "",
      youtube_url: productData.youtube_url || "",
      retailer_url: productData.retailer_url || productData.amazon_url || "https://www.amazon.in",
      retailer_domain: productData.retailer_domain || extractRetailerDomain(productData.retailer_url || productData.amazon_url || "https://www.amazon.in"),
      amazon_url: productData.retailer_url || productData.amazon_url || "https://www.amazon.in",
      strengths: [],
      trade_offs: [],
      final_take: "",
      verdict: "",
      reasons_to_buy: [],
      reasons_not_to_buy: [],
      pros: [],
      cons: [],
      quick_take: "",
      key_specs: [],
      good_for: [],
      skip_if: [],
      what_to_check: [],
      matrix_performance: null,
      matrix_value: null,
      matrix_ease_of_use: null,
      matrix_portability: null,
      matrix_compatibility: null,
      matrix_long_term_suitability: null,
      research_basis: "",
      research_sources: [],
      last_reviewed_at: null,
      is_out_of_stock: false,
      clicks_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const strengthsList =
      productData.strengths ||
      productData.reasons_to_buy ||
      productData.pros ||
      base.strengths ||
      [];
    const tradeOffsList =
      productData.trade_offs ||
      productData.reasons_not_to_buy ||
      productData.cons ||
      base.trade_offs ||
      [];
    const finalTakeText =
      productData.final_take ||
      productData.verdict ||
      base.final_take ||
      "";

    const createdProduct: DbProduct = {
      ...base,
      ...productData,
      id,
      strengths: strengthsList,
      trade_offs: tradeOffsList,
      reasons_to_buy: strengthsList,
      reasons_not_to_buy: tradeOffsList,
      pros: strengthsList,
      cons: tradeOffsList,
      final_take: finalTakeText,
      verdict: finalTakeText,
      quick_take: productData.quick_take || base.quick_take || productData.description || base.description || "",
      updated_at: new Date().toISOString(),
    };

    const updated = [createdProduct, ...products];
    saveStoredProducts(updated);
    return createdProduct;
  }

  const existing = products[index];

  const strengthsList =
    productData.strengths ||
    productData.reasons_to_buy ||
    productData.pros ||
    existing.strengths ||
    existing.reasons_to_buy ||
    existing.pros ||
    [];
  const tradeOffsList =
    productData.trade_offs ||
    productData.reasons_not_to_buy ||
    productData.cons ||
    existing.trade_offs ||
    existing.reasons_not_to_buy ||
    existing.cons ||
    [];
  const finalTakeText =
    productData.final_take ||
    productData.verdict ||
    existing.final_take ||
    existing.verdict ||
    "";

  const updatedYoutubeUrl =
    productData.youtube_url !== undefined
      ? productData.youtube_url
      : (productData as any).youtubeUrl !== undefined
      ? (productData as any).youtubeUrl
      : productData.youtube_url !== undefined
      ? productData.youtube_url
      : existing.youtube_url || existing.youtube_url;

  const updated: DbProduct = {
    ...existing,
    ...productData,
    id: existing.id,
    youtube_url: updatedYoutubeUrl || undefined,
    strengths: strengthsList,
    trade_offs: tradeOffsList,
    reasons_to_buy: strengthsList,
    reasons_not_to_buy: tradeOffsList,
    pros: strengthsList,
    cons: tradeOffsList,
    final_take: finalTakeText,
    verdict: finalTakeText,
    quick_take: productData.quick_take || existing.quick_take || productData.description || existing.description || "",
    updated_at: new Date().toISOString(),
  };

  products[index] = updated;
  saveStoredProducts(products);
  return updated;
}

export function deleteStoredProduct(id: string): boolean {
  const products = getStoredProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  saveStoredProducts(filtered);
  return true;
}

export function getStoredClicks(): Array<{ id: string; product_id: string; date: string; count: number; created_at: string }> {
  try {
    ensureDirectoryExistence(CLICKS_FILE);
    if (!fs.existsSync(CLICKS_FILE)) {
      return [];
    }
    const content = fs.readFileSync(CLICKS_FILE, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordStoredClick(productId: string): boolean {
  try {
    const clicks = getStoredClicks();
    const today = new Date().toISOString().split("T")[0];
    const newClick = {
      id: `clk-${Date.now()}`,
      product_id: productId,
      date: today,
      count: 1,
      created_at: new Date().toISOString(),
    };
    clicks.push(newClick);
    ensureDirectoryExistence(CLICKS_FILE);
    fs.writeFileSync(CLICKS_FILE, JSON.stringify(clicks, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}
