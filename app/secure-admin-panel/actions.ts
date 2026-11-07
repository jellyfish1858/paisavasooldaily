"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type {
  DbProduct,
  NewDbProduct,
  DbCollection,
  NewDbCollection,
  DbCollectionSection,
  NewDbCollectionSection,
  DbCollectionProduct,
  NewDbCollectionProduct,
  CollectionWithRelations,
  CollectionStatus,
  CollectionCategory,
  CollectionSectionType,
} from "@/utils/supabase/types";
import {
  getStoredProducts,
  getStoredProductById,
  saveStoredProduct,
  updateStoredProduct,
  deleteStoredProduct,
  recordStoredClick,
  getStoredClicks,
} from "@/utils/storage";
import { extractRetailerDomain } from "@/config/affiliate";
import {
  calculateProductClickAnalytics,
  type AnalyticsSummary,
  type ProductClickData,
} from "@/lib/analytics";
import { extractUnmappedSchemaColumn } from "@/lib/validation";

export { extractUnmappedSchemaColumn };

function stripProductMeta(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<!--\s*PRODUCT_META:\s*[\s\S]*?-->/gi, "").trim();
}

function toCleanStringArray(val: any): string[] {
  if (Array.isArray(val)) return val.map((s) => stripProductMeta(String(s)));
  if (typeof val === "string" && val.trim()) return [stripProductMeta(val.trim())];
  return [];
}

function decodeProductMeta(text: string): { cleanText: string; meta: Record<string, any> } {
  if (!text) return { cleanText: "", meta: {} };
  const match = text.match(/<!--\s*PRODUCT_META:\s*([\s\S]*?)\s*-->/i);
  const cleanText = text.replace(/<!--\s*PRODUCT_META:\s*[\s\S]*?-->/gi, "").trim();
  if (!match) return { cleanText, meta: {} };
  try {
    const meta = JSON.parse(match[1]);
    return { cleanText, meta: meta || {} };
  } catch {
    return { cleanText, meta: {} };
  }
}

/**
 * Normalizes any category string or product ID into the approved 3-category taxonomy:
 * 1. Travel
 * 2. Beauty & Personal Care
 * 3. Electronics & Tech Accessories
 */
function normalizeCategoryName(rawCategory?: string, title?: string, id?: string): string {
  if (id) {
    const TRAVEL_IDS = [
      "750b24bf-b524-498f-9f81-8652e54f028d", // FLYNGO Umbrella
      "bb4ba26d-b6c6-4766-9bbd-1b323c979198", // Aristocrat Airpro Max Set of 3 Trolley Bags
      "6619b458-2355-4d1d-93a6-274f32aee7ef", // Gear Classic 6 Laptop Backpack
      "4ad2472f-d973-45fa-ba8f-8275eece0a8c", // Flyngo 8 Pcs Packing Cubes
      "3f4c9827-0e0c-40f8-a5b5-585a4abc6df1", // DailyObjects Passport Wallet
      "7b01d27d-209d-44ea-9b99-9a74e9a22199", // Wildcraft RSK 45 Rucksack
      "d766c92a-0afc-4886-9c6e-433199574a55", // Wosta Insulated Travel Coffee Mug 2.0
    ];
    if (TRAVEL_IDS.includes(id)) return "Travel";

    const BEAUTY_IDS = [
      "4bb03cfa-eaed-4876-8b0b-8c3490a1a40a", // Ghar Soaps Sandalwood & Saffron Bath Bar
    ];
    if (BEAUTY_IDS.includes(id)) return "Beauty & Personal Care";

    const TECH_IDS = [
      "bddf3207-b2ab-4f96-8ab7-261492885b66", // Samsung Type C to C Cable
      "14241aaf-4c2d-4709-bc07-6101dfe8aa04", // Portronics My Buddy K Laptop Stand
      "48a3bcdf-273f-4935-9f47-353901faac2f", // URBN 20000 mAh 65W Power Bank
      "87d5f0bb-a6f0-48e6-8052-a826e18e2103", // GM DisplayPulse 100W GaN Fast Charger
    ];
    if (TECH_IDS.includes(id)) return "Electronics & Tech Accessories";
  }

  const clean = (rawCategory || "").trim().toLowerCase();
  if (
    clean === "travel" ||
    clean === "travel-gear" ||
    clean === "luggage & travel" ||
    clean === "travel accessories" ||
    clean === "travel & trekking gear" ||
    clean === "everyday carry" ||
    clean === "everyday  carry(edc)" ||
    clean === "tech & commuter accessories" ||
    clean.includes("luggage") ||
    clean.includes("travel") ||
    clean.includes("backpack") ||
    clean.includes("carry") ||
    clean.includes("packing") ||
    clean.includes("mug") ||
    clean.includes("umbrella") ||
    clean.includes("passport") ||
    clean.includes("rucksack")
  ) {
    return "Travel";
  }

  if (
    clean === "beauty & personal care" ||
    clean === "beauty & fashion" ||
    clean === "beauty-personal-care" ||
    clean === "personal care / beauty" ||
    clean.includes("beauty") ||
    clean.includes("fashion") ||
    clean.includes("personal care") ||
    clean.includes("bath") ||
    clean.includes("soap")
  ) {
    return "Beauty & Personal Care";
  }

  if (
    clean === "electronics & tech accessories" ||
    clean === "electronics-tech-accessories" ||
    clean === "tech accessories" ||
    clean === "portable-power" ||
    clean.includes("tech") ||
    clean.includes("electronics") ||
    clean.includes("power") ||
    clean.includes("charger") ||
    clean.includes("cable") ||
    clean.includes("stand")
  ) {
    return "Electronics & Tech Accessories";
  }

  return "Travel";
}

const CANONICAL_PRODUCT_SLUGS: Record<string, string> = {
  "d766c92a-0afc-4886-9c6e-433199574a55": "wosta-insulated-travel-coffee-mug-510ml",
  "bb4ba26d-b6c6-4766-9bbd-1b323c979198": "aristocrat-airpro-max-3-piece-luggage-set",
  "87d5f0bb-a6f0-48e6-8052-a826e18e2103": "gm-displaypulse-100w-gan-fast-charger",
  "6619b458-2355-4d1d-93a6-274f32aee7ef": "gear-classic-6-31l-laptop-backpack",
  "4ad2472f-d973-45fa-ba8f-8275eece0a8c": "flyngo-8-piece-travel-packing-cubes",
  "750b24bf-b524-498f-9f81-8652e54f028d": "flyngo-windproof-travel-umbrella",
  "3f4c9827-0e0c-40f8-a5b5-585a4abc6df1": "dailyobjects-check-in-passport-wallet",
  "7b01d27d-209d-44ea-9b99-9a74e9a22199": "wildcraft-expedition-rsk-45l-rucksack",
  "4bb03cfa-eaed-4876-8b0b-8c3490a1a40a": "ghar-soaps-sandalwood-saffron-bath-bar",
  "bddf3207-b2ab-4f96-8ab7-261492885b66": "samsung-type-c-to-c-cable-1m",
  "14241aaf-4c2d-4709-bc07-6101dfe8aa04": "portronics-my-buddy-k-portable-laptop-stand",
  "48a3bcdf-273f-4935-9f47-353901faac2f": "urbn-20000mah-65w-ultra-volt-power-bank",
};

function normalizeProductSlug(rawSlug?: string | null, id?: string, title?: string): string {
  if (rawSlug && rawSlug.trim()) {
    return rawSlug.trim().toLowerCase();
  }
  if (id && CANONICAL_PRODUCT_SLUGS[id]) {
    return CANONICAL_PRODUCT_SLUGS[id];
  }
  if (title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }
  return id || "product";
}

/**
 * Normalizes a database row or JSON fallback object into canonical DbProduct format.
 */
export async function normalizeProduct(raw: any): Promise<DbProduct> {
  return normalizeDbProduct(raw);
}

function normalizeDbProduct(raw: any): DbProduct {
  const { cleanText: cleanDescription, meta } = decodeProductMeta(raw.description || "");

  const fallbackStrengths: string[] = Array.isArray(raw.strengths)
    ? raw.strengths
    : Array.isArray(raw.reasons_to_buy)
    ? raw.reasons_to_buy
    : Array.isArray(raw.reasonsToBuy)
    ? raw.reasonsToBuy
    : Array.isArray(raw.pros)
    ? raw.pros
    : [];

  const fallbackTradeOffs: string[] = Array.isArray(raw.trade_offs)
    ? raw.trade_offs
    : Array.isArray(raw.reasons_not_to_buy)
    ? raw.reasons_not_to_buy
    : Array.isArray(raw.reasonsNotToBuy)
    ? raw.reasonsNotToBuy
    : Array.isArray(raw.cons)
    ? raw.cons
    : [];

  const strengthsList: string[] =
    Array.isArray(meta.strengths) && meta.strengths.length > 0
      ? meta.strengths
      : fallbackStrengths;

  const tradeOffsList: string[] =
    Array.isArray(meta.trade_offs) && meta.trade_offs.length > 0
      ? meta.trade_offs
      : fallbackTradeOffs;

  const finalTakeRaw: string =
    raw.final_take ||
    raw.verdict ||
    raw.target_profile ||
    raw.targetProfile ||
    meta.final_take ||
    "";
  const finalTakeText: string = stripProductMeta(finalTakeRaw);

  const quickTakeRaw: string =
    raw.quick_take ||
    meta.quick_take ||
    cleanDescription ||
    "";
  const quickTakeText: string = stripProductMeta(quickTakeRaw);

  const keySpecs: string[] =
    raw.key_specs && Array.isArray(raw.key_specs) && raw.key_specs.length > 0
      ? raw.key_specs
      : Array.isArray(meta.key_specs)
      ? meta.key_specs
      : [];

  const goodFor: string[] =
    raw.good_for && Array.isArray(raw.good_for) && raw.good_for.length > 0
      ? raw.good_for
      : Array.isArray(meta.good_for)
      ? meta.good_for
      : [];

  const skipIf: string[] =
    raw.skip_if && Array.isArray(raw.skip_if) && raw.skip_if.length > 0
      ? raw.skip_if
      : Array.isArray(meta.skip_if)
      ? meta.skip_if
      : [];

  const whatToCheck: string[] =
    raw.what_to_check && Array.isArray(raw.what_to_check) && raw.what_to_check.length > 0
      ? raw.what_to_check
      : Array.isArray(meta.what_to_check)
      ? meta.what_to_check
      : [];

  const researchBasisText: string = stripProductMeta(raw.research_basis || meta.research_basis || "");
  const researchSources: any[] =
    raw.research_sources && Array.isArray(raw.research_sources) && raw.research_sources.length > 0
      ? raw.research_sources
      : Array.isArray(meta.research_sources)
      ? meta.research_sources
      : [];

  const lastReviewedAt: string | null = raw.last_reviewed_at || meta.last_reviewed_at || null;

  return {
    id: raw.id,
    title: stripProductMeta(raw.title || "Curated Product"),
    slug: normalizeProductSlug(raw.slug, raw.id, raw.title),
    description: stripProductMeta(cleanDescription),
    category: normalizeCategoryName(raw.category, raw.title, raw.id),
    badge: raw.badge ? stripProductMeta(raw.badge) : undefined,
    image_url: raw.image_url || raw.imageUrl || "",
    youtube_url: raw.youtube_url || raw.youtubeUrl || raw.videoUrl || undefined,
    retailer_url: raw.retailer_url || raw.amazon_url || raw.amazonUrl || "https://www.amazon.in",
    retailer_domain: raw.retailer_domain || extractRetailerDomain(raw.retailer_url || raw.amazon_url || raw.amazonUrl || "https://www.amazon.in"),
    amazon_url: raw.retailer_url || raw.amazon_url || raw.amazonUrl || "https://www.amazon.in",
    quick_take: quickTakeText || undefined,
    key_specs: keySpecs,
    strengths: strengthsList.map((s) => stripProductMeta(String(s))),
    trade_offs: tradeOffsList.map((t) => stripProductMeta(String(t))),
    good_for: goodFor.map((g) => stripProductMeta(String(g))),
    skip_if: skipIf.map((s) => stripProductMeta(String(s))),
    what_to_check: whatToCheck.map((w) => stripProductMeta(String(w))),
    final_take: finalTakeText || undefined,
    reasons_to_buy: strengthsList.map((s) => stripProductMeta(String(s))),
    reasons_not_to_buy: tradeOffsList.map((t) => stripProductMeta(String(t))),
    pros: strengthsList.map((s) => stripProductMeta(String(s))),
    cons: tradeOffsList.map((t) => stripProductMeta(String(t))),
    verdict: finalTakeText,
    matrix_performance: raw.matrix_performance ?? meta.matrix_performance ?? null,
    matrix_value: raw.matrix_value ?? meta.matrix_value ?? null,
    matrix_ease_of_use: raw.matrix_ease_of_use ?? meta.matrix_ease_of_use ?? null,
    matrix_portability: raw.matrix_portability ?? meta.matrix_portability ?? null,
    matrix_compatibility: raw.matrix_compatibility ?? meta.matrix_compatibility ?? null,
    matrix_long_term_suitability: raw.matrix_long_term_suitability ?? meta.matrix_long_term_suitability ?? null,
    research_basis: researchBasisText || undefined,
    research_sources: researchSources,
    last_reviewed_at: lastReviewedAt,
    is_out_of_stock:
      raw.is_out_of_stock !== undefined
        ? Boolean(raw.is_out_of_stock)
        : Boolean(meta.is_out_of_stock),
    clicks_count: Number(raw.clicks_count) || 0,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
  };
}

/**
 * Server-side authorization check.
 * Verifies that:
 * 1. An active Supabase Auth session exists.
 * 2. The authenticated user has role = 'admin' in public.admin_users.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false as const,
      error: "Authentication required. Please sign in as an administrator.",
      user: null,
      supabase,
    };
  }

  const { data: adminRecord, error: adminErr } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (adminErr || !adminRecord) {
    return {
      authorized: false as const,
      error: "Access Denied: You do not have administrator authorization.",
      user,
      supabase,
    };
  }

  return {
    authorized: true as const,
    error: null,
    user,
    supabase,
  };
}

/**
 * Signs in the administrator using Supabase Auth and validates admin_users authorization.
 */
export async function loginAdminAction(emailInput: string, passwordInput: string) {
  try {
    const email = (emailInput || "").trim().toLowerCase();
    const password = (passwordInput || "").trim();

    if (!email || !password) {
      return { success: false, error: "Please provide both an email and password." };
    }

    const supabase = await createClient();
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authErr || !authData.user) {
      return {
        success: false,
        error: authErr?.message || "Invalid administrator email or password.",
      };
    }

    // Verify admin role authorization in public.admin_users
    const { data: adminRecord, error: adminErr } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminErr || !adminRecord) {
      // User is authenticated but NOT an administrator: revoke session immediately
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Access Denied: This account does not have administrator privileges.",
      };
    }

    revalidatePath("/secure-admin-panel");
    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    };
  } catch (err: any) {
    console.error("loginAdminAction error:", err);
    return { success: false, error: err?.message || "Authentication error." };
  }
}

/**
 * Signs out the admin via Supabase Auth.
 */
export async function logoutAdminAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/");
    revalidatePath("/secure-admin-panel");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Sign out failed." };
  }
}

/**
 * Checks if the current request has a valid Supabase Auth session with admin authorization.
 */
export async function checkAdminAuthAction(): Promise<{
  isAuthenticated: boolean;
  email: string | null;
  userId: string | null;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized || !authCheck.user) {
      return { isAuthenticated: false, email: null, userId: null };
    }
    return {
      isAuthenticated: true,
      email: authCheck.user.email || null,
      userId: authCheck.user.id,
    };
  } catch {
    return { isAuthenticated: false, email: null, userId: null };
  }
}

/**
 * Server action to fetch all products for the public storefront.
 * Public SELECT access is permitted by Row Level Security.
 */
export async function fetchProductsAction(): Promise<{ success: boolean; data: DbProduct[]; error?: string }> {
  try {
    const productMap = new Map<string, DbProduct>();
    let clicksMap: Record<string, number> = {};

    // 1. Fetch Supabase products FIRST (Primary Source of Truth)
    try {
      const supabase = await createClient();
      const { data: supabaseProducts, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(supabaseProducts)) {
        supabaseProducts.forEach((sp) => {
          const norm = normalizeDbProduct(sp);
          productMap.set(norm.id, norm);
        });
      } else if (error) {
        console.warn("Supabase products fetch warning:", error.message);
      }
    } catch (err) {
      console.warn("Supabase fetch notice:", err);
    }

    // 2. Fallback to local store products if Supabase returned nothing (e.g. offline dev)
    try {
      const localProducts = getStoredProducts();
      localProducts.forEach((p) => {
        if (!productMap.has(p.id)) {
          productMap.set(p.id, normalizeDbProduct(p));
        }
      });

      const localClicks = getStoredClicks();
      localClicks.forEach((c) => {
        clicksMap[c.product_id] = (clicksMap[c.product_id] || 0) + (c.count || 1);
      });
    } catch {
      // Ignore local storage read errors in serverless environments
    }

    const unifiedList = Array.from(productMap.values()).map((p) => ({
      ...p,
      clicks_count: clicksMap[p.id] || p.clicks_count || 0,
    }));

    return { success: true, data: unifiedList };
  } catch (err: any) {
    console.warn("fetchProductsAction fallback:", err?.message);
    try {
      const local = getStoredProducts();
      return { success: true, data: local.map(normalizeDbProduct) };
    } catch {
      return { success: true, data: [] };
    }
  }
}

/**
 * Server action to fetch a single product by ID.
 * Public SELECT access is permitted by Row Level Security.
 */
export async function fetchProductByIdAction(id: string): Promise<{ success: boolean; data: DbProduct | null; error?: string }> {
  try {
    let supabaseProduct: DbProduct | null = null;

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        supabaseProduct = normalizeDbProduct(data);
      }
    } catch (err) {
      console.warn("Supabase fetchProductByIdAction error:", err);
    }

    if (supabaseProduct) {
      return { success: true, data: supabaseProduct };
    }

    const localProduct = getStoredProductById(id);
    if (localProduct) {
      return { success: true, data: normalizeDbProduct(localProduct) };
    }

    return { success: true, data: null };
  } catch (err: any) {
    console.error("fetchProductByIdAction exception:", err);
    return { success: false, data: null, error: err?.message };
  }
}

/**
 * Server action to fetch a single product by canonical slug.
 * Public SELECT access is permitted by Row Level Security.
 */
export async function fetchProductBySlugAction(slug: string): Promise<{ success: boolean; data: DbProduct | null; error?: string }> {
  try {
    const cleanSlug = (slug || "").trim().toLowerCase();
    if (!cleanSlug) {
      return { success: true, data: null };
    }

    let supabaseProduct: DbProduct | null = null;

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (!error && data) {
        supabaseProduct = normalizeDbProduct(data);
      }
    } catch (err) {
      console.warn("Supabase fetchProductBySlugAction error:", err);
    }

    if (supabaseProduct) {
      return { success: true, data: supabaseProduct };
    }

    // Fallback: check stored products or fetchProductsAction
    const allRes = await fetchProductsAction();
    if (allRes.success && allRes.data) {
      const found = allRes.data.find((p) => p.slug === cleanSlug);
      if (found) {
        return { success: true, data: found };
      }
    }

    return { success: true, data: null };
  } catch (err: any) {
    console.error("fetchProductBySlugAction exception:", err);
    return { success: false, data: null, error: err?.message };
  }
}

/**
 * Server action to post a new product to the catalog.
 * Protected by server-side requireAdmin() and database RLS.
 */
export async function postProduct(productData: NewDbProduct): Promise<{ success: boolean; data?: DbProduct; error?: string }> {
  try {
    // 1. Enforce admin authorization
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    const generateSlug = (t: string) =>
      t
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const cleanStr = (val?: string | null): string | null => {
      if (!val) return null;
      const trimmed = stripProductMeta(val).trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const slug = productData.slug?.trim() || generateSlug(productData.title);

    const strengths = (productData.strengths || productData.reasons_to_buy || productData.pros || [])
      .map((s) => stripProductMeta(String(s)).trim())
      .filter(Boolean);
    const tradeOffs = (productData.trade_offs || productData.reasons_not_to_buy || productData.cons || [])
      .map((t) => stripProductMeta(String(t)).trim())
      .filter(Boolean);
    const finalTake = cleanStr(productData.final_take || productData.verdict);
    const quickTake = cleanStr(productData.quick_take || productData.description);

    const productId = (productData as any).id;

    const mediaUrl = cleanStr(
      productData.youtube_url ||
      (productData as any).youtubeUrl ||
      productData.video_url ||
      ""
    );

    const cleanedSpecs = Array.isArray(productData.key_specs)
      ? productData.key_specs
          .map((s) => (typeof s === "string" ? s.trim() : s))
          .filter(Boolean)
      : productData.key_specs || [];

    const retailerUrl = (productData.retailer_url || productData.amazon_url || "").trim();
    const retailerDomain = productData.retailer_domain || extractRetailerDomain(retailerUrl);

    const fullPayload: Record<string, any> = {
      ...(productId ? { id: productId } : {}),
      title: stripProductMeta(productData.title || "").trim(),
      slug,
      description: quickTake || stripProductMeta(productData.title || "").trim(),
      category: normalizeCategoryName(productData.category, productData.title, productId),
      badge: cleanStr(productData.badge),
      image_url: (productData.image_url || "").trim(),
      youtube_url: mediaUrl,
      retailer_url: retailerUrl,
      retailer_domain: retailerDomain,
      amazon_url: retailerUrl,
      quick_take: quickTake,
      key_specs: cleanedSpecs,
      strengths,
      trade_offs: tradeOffs,
      pros: strengths,
      cons: tradeOffs,
      good_for: toCleanStringArray(productData.good_for).map((s) => s.trim()).filter(Boolean),
      skip_if: toCleanStringArray(productData.skip_if).map((s) => s.trim()).filter(Boolean),
      final_take: finalTake,
    };

    let insertedRow: any = null;
    const payloadToInsert: Record<string, any> = { ...fullPayload };
    let lastError: any = null;

    // Schema-resilient insert loop (auto-strips unmapped columns if not found in Supabase schema cache)
    for (let attempt = 0; attempt < 8; attempt++) {
      const { data, error } = await supabase
        .from("products")
        .insert([payloadToInsert])
        .select()
        .single();

      if (!error && data) {
        insertedRow = data;
        lastError = null;
        break;
      }

      lastError = error;
      const errMsg = error?.message || "";
      const unmappedCol = extractUnmappedSchemaColumn(errMsg);

      if (unmappedCol && payloadToInsert[unmappedCol] !== undefined) {
        console.warn(`[Supabase Schema Resilient Insert] Removing unmapped column '${unmappedCol}' from payload (attempt ${attempt + 1})`);
        if (unmappedCol === "retailer_url" && payloadToInsert.retailer_url) {
          payloadToInsert.amazon_url = payloadToInsert.retailer_url;
        }
        delete payloadToInsert[unmappedCol];
        continue;
      }

      // Fallbacks for known schema variations
      if (errMsg.includes("youtube_url") && payloadToInsert.youtube_url !== undefined) {
        delete payloadToInsert.youtube_url;
        continue;
      }
      if (errMsg.includes("retailer_url") && payloadToInsert.retailer_url !== undefined) {
        payloadToInsert.amazon_url = payloadToInsert.retailer_url;
        delete payloadToInsert.retailer_url;
        delete payloadToInsert.retailer_domain;
        continue;
      }

      // Unrecognized error, do not loop further
      break;
    }

    if (lastError || !insertedRow) {
      console.error("Supabase product insert error:", lastError?.message);
      return { success: false, error: lastError?.message || "Failed to publish product to database." };
    }

    const normalized = normalizeDbProduct(insertedRow);

    try {
      saveStoredProduct(normalized);
    } catch (e) {
      console.warn("Local storage cache warning (non-fatal):", e);
    }

    revalidatePath("/");
    revalidatePath("/secure-admin-panel");
    if (normalized.slug) {
      revalidatePath(`/product/${normalized.slug}`);
    }
    return { success: true, data: normalized };
  } catch (err: any) {
    console.error("postProduct exception:", err);
    return { success: false, error: err?.message || "Failed to add product." };
  }
}

/**
 * Server action to update an existing product.
 * Protected by server-side requireAdmin() and database RLS.
 */
export async function updateProductAction(
  id: string,
  productData: Partial<DbProduct>
): Promise<{ success: boolean; data?: DbProduct; error?: string }> {
  try {
    // 1. Enforce admin authorization
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    const { data: existingRow, error: fetchErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) {
      console.warn("Supabase fetch for update warning:", fetchErr.message);
    }

    const existingNormalized = existingRow ? normalizeDbProduct(existingRow) : getStoredProductById(id);

    const cleanStr = (val?: string | null): string | null => {
      if (!val) return null;
      const trimmed = stripProductMeta(val).trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const fullUpdate: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (productData.title !== undefined) fullUpdate.title = stripProductMeta(productData.title).trim();
    if (productData.slug !== undefined) fullUpdate.slug = productData.slug.trim();
    if (productData.category !== undefined) fullUpdate.category = normalizeCategoryName(productData.category, productData.title, id);
    if (productData.badge !== undefined) fullUpdate.badge = cleanStr(productData.badge);
    if (productData.image_url !== undefined) fullUpdate.image_url = productData.image_url.trim();

    const updatedRetailerUrl = productData.retailer_url !== undefined
      ? productData.retailer_url.trim()
      : productData.amazon_url !== undefined
      ? productData.amazon_url.trim()
      : undefined;

    if (updatedRetailerUrl !== undefined) {
      fullUpdate.retailer_url = updatedRetailerUrl;
      fullUpdate.retailer_domain = productData.retailer_domain || extractRetailerDomain(updatedRetailerUrl);
    } else if (productData.retailer_domain !== undefined) {
      fullUpdate.retailer_domain = productData.retailer_domain;
    }

    if (productData.quick_take !== undefined) {
      const qt = cleanStr(productData.quick_take);
      fullUpdate.quick_take = qt;
      if (qt) fullUpdate.description = qt;
    } else if (productData.description !== undefined) {
      fullUpdate.description = stripProductMeta(productData.description).trim();
    }

    if (productData.key_specs !== undefined) {
      fullUpdate.key_specs = Array.isArray(productData.key_specs)
        ? productData.key_specs.map((s) => (typeof s === "string" ? s.trim() : s)).filter(Boolean)
        : productData.key_specs;
    }
    if (productData.good_for !== undefined) {
      fullUpdate.good_for = toCleanStringArray(productData.good_for).map((g) => g.trim()).filter(Boolean);
    }
    if (productData.skip_if !== undefined) {
      fullUpdate.skip_if = toCleanStringArray(productData.skip_if).map((s) => s.trim()).filter(Boolean);
    }
    if (productData.strengths !== undefined) {
      const cleanStrengths = productData.strengths.map((s) => stripProductMeta(String(s)).trim()).filter(Boolean);
      fullUpdate.strengths = cleanStrengths;
      fullUpdate.pros = cleanStrengths;
    }
    if (productData.trade_offs !== undefined) {
      const cleanTradeOffs = productData.trade_offs.map((t) => stripProductMeta(String(t)).trim()).filter(Boolean);
      fullUpdate.trade_offs = cleanTradeOffs;
      fullUpdate.cons = cleanTradeOffs;
    }
    if (productData.final_take !== undefined) {
      fullUpdate.final_take = cleanStr(productData.final_take);
    }

    const updatedMediaUrl = productData.youtube_url !== undefined
      ? productData.youtube_url
      : (productData as any).youtubeUrl !== undefined
      ? (productData as any).youtubeUrl
      : productData.video_url !== undefined
      ? productData.video_url
      : undefined;

    if (updatedMediaUrl !== undefined) {
      const cleaned = cleanStr(updatedMediaUrl);
      fullUpdate.youtube_url = cleaned;
    }

    let updatedRow: any = null;
    const payloadToUpdate: Record<string, any> = { ...fullUpdate };
    let lastUpdateError: any = null;

    // Schema-resilient update loop (auto-strips unmapped columns if not found in Supabase schema cache)
    for (let attempt = 0; attempt < 8; attempt++) {
      const { data, error } = await supabase
        .from("products")
        .update(payloadToUpdate)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (!error && data) {
        updatedRow = data;
        lastUpdateError = null;
        break;
      }

      lastUpdateError = error;
      const errMsg = error?.message || "";
      const unmappedCol = extractUnmappedSchemaColumn(errMsg);

      if (unmappedCol && payloadToUpdate[unmappedCol] !== undefined) {
        console.warn(`[Supabase Schema Resilient Update] Removing unmapped column '${unmappedCol}' from payload (attempt ${attempt + 1})`);
        if (unmappedCol === "retailer_url" && payloadToUpdate.retailer_url !== undefined) {
          payloadToUpdate.amazon_url = payloadToUpdate.retailer_url;
        }
        delete payloadToUpdate[unmappedCol];
        continue;
      }

      if (errMsg.includes("youtube_url") && payloadToUpdate.youtube_url !== undefined) {
        delete payloadToUpdate.youtube_url;
        continue;
      }
      if (errMsg.includes("retailer_url") && payloadToUpdate.retailer_url !== undefined) {
        if (payloadToUpdate.retailer_url !== undefined) {
          payloadToUpdate.amazon_url = payloadToUpdate.retailer_url;
        }
        delete payloadToUpdate.retailer_url;
        delete payloadToUpdate.retailer_domain;
        continue;
      }

      break;
    }

    if (lastUpdateError || !updatedRow) {
      console.error("Supabase product update error:", lastUpdateError?.message);
      return { success: false, error: lastUpdateError?.message || "Failed to update product." };
    }

    const normalized = normalizeDbProduct(
      updatedRow || { ...existingNormalized, ...fullUpdate, id }
    );

    try {
      updateStoredProduct(id, normalized);
    } catch (e) {
      console.warn("Local storage cache update warning (non-fatal):", e);
    }

    revalidatePath("/");
    revalidatePath("/secure-admin-panel");
    revalidatePath(`/product/${id}`);
    if (normalized.slug) {
      revalidatePath(`/product/${normalized.slug}`);
    }

    return { success: true, data: normalized };
  } catch (err: any) {
    console.error("updateProductAction exception:", err);
    return { success: false, error: err?.message || "Failed to update product." };
  }
}

/**
 * Server action to delete a product by ID.
 * Protected by server-side requireAdmin() and database RLS.
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Enforce admin authorization
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    const { error: delErr } = await supabase.from("products").delete().eq("id", productId);
    if (delErr) {
      console.error("Supabase delete error:", delErr.message);
      return { success: false, error: delErr.message };
    }

    try {
      deleteStoredProduct(productId);
    } catch (e) {
      console.warn("Local storage delete warning (non-fatal):", e);
    }

    revalidatePath("/");
    revalidatePath("/secure-admin-panel");
    return { success: true };
  } catch (err: any) {
    console.error("deleteProduct exception:", err);
    return { success: false, error: err?.message || "Failed to delete product." };
  }
}

/**
 * Records an outbound affiliate click event.
 * Minimal public INSERT permitted by RLS.
 */
export async function recordClickAction(
  productId: string,
  retailerDomain?: string
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    // 1. Record into affiliate_clicks
    try {
      await supabase.from("affiliate_clicks").insert([
        {
          product_id: productId,
          retailer_domain: retailerDomain || "unknown",
        },
      ]);
    } catch (e) {
      console.warn("affiliate_clicks insert notice:", e);
    }

    // 2. Minimal append-only INSERT (Row Level Security permits anon INSERT)
    const { error } = await supabase.from("clicks").insert([
      {
        product_id: productId,
        date: today,
        count: 1,
      },
    ]);

    if (error) {
      console.warn("Supabase click record notice:", error.message);
    }

    try {
      recordStoredClick(productId);
    } catch {}

    revalidatePath("/secure-admin-panel");
    return { success: true };
  } catch (err: any) {
    console.warn("recordClickAction warning:", err?.message);
    try {
      recordStoredClick(productId);
    } catch {}
    return { success: true };
  }
}

/**
 * Fetches grouped product click analytics from affiliate_clicks (with fallback to clicks/local).
 * Returns data in format: { productId, productTitle, totalClicks, retailerDomain, clicksPerDomain: {} }
 * Protected by server-side requireAdmin().
 */
export async function fetchProductClickAnalyticsAction(): Promise<{
  success: boolean;
  error?: string;
  data: AnalyticsSummary;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return {
        success: false,
        error: authCheck.error,
        data: calculateProductClickAnalytics([], []),
      };
    }

    const { supabase } = authCheck;

    // 1. Fetch products
    const productsRes = await fetchProductsAction();
    const products = productsRes.data || [];

    // 2. Query affiliate_clicks
    let rawClicks: any[] = [];
    try {
      const { data: affClicks, error: affErr } = await supabase
        .from("affiliate_clicks")
        .select("id, product_id, retailer_domain, created_at")
        .order("created_at", { ascending: false });

      if (!affErr && Array.isArray(affClicks) && affClicks.length > 0) {
        rawClicks = affClicks;
      }
    } catch (e) {
      console.warn("affiliate_clicks query fallback notice:", e);
    }

    // 3. Fallback to clicks table if affiliate_clicks was empty or errored
    if (rawClicks.length === 0) {
      try {
        const { data: legacyClicks, error: legErr } = await supabase
          .from("clicks")
          .select("id, product_id, count, date, created_at");

        if (!legErr && Array.isArray(legacyClicks) && legacyClicks.length > 0) {
          rawClicks = legacyClicks;
        }
      } catch (e) {
        console.warn("clicks query fallback notice:", e);
      }
    }

    // 4. Fallback to local stored clicks if still empty
    if (rawClicks.length === 0) {
      try {
        const localClicks = getStoredClicks();
        if (Array.isArray(localClicks) && localClicks.length > 0) {
          rawClicks = localClicks;
        }
      } catch {}
    }

    const summary = calculateProductClickAnalytics(products, rawClicks);

    return {
      success: true,
      data: summary,
    };
  } catch (err: any) {
    console.error("fetchProductClickAnalyticsAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to fetch analytics",
      data: calculateProductClickAnalytics([], []),
    };
  }
}

/**
 * Fetches click analytics for admin reporting.
 * Protected by server-side requireAdmin() and database RLS.
 */
export async function fetchClicksAction(): Promise<{ success: boolean; data: any[]; error?: string }> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, data: [], error: authCheck.error };
    }
    const { supabase } = authCheck;

    const { data, error } = await supabase
      .from("clicks")
      .select("id, product_id, date, count, created_at")
      .order("date", { ascending: false });

    if (!error && Array.isArray(data)) {
      return { success: true, data };
    }

    if (error) {
      console.warn("Supabase fetchClicksAction notice:", error.message);
    }

    const localClicks = getStoredClicks();
    return { success: true, data: localClicks };
  } catch (err: any) {
    console.warn("fetchClicksAction error:", err?.message);
    return { success: false, data: [], error: err?.message };
  }
}

/**
 * Aggregates analytics for the admin dashboard.
 * Protected by server-side requireAdmin() and database RLS.
 */
export async function fetchAnalyticsAction(): Promise<{
  success: boolean;
  error?: string;
  data: {
    totalProducts: number;
    totalClicks: number;
    topClickedProducts: Array<{ id: string; title: string; category: string; clicks: number }>;
    recentClicks: Array<any>;
  };
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return {
        success: false,
        error: authCheck.error,
        data: {
          totalProducts: 0,
          totalClicks: 0,
          topClickedProducts: [],
          recentClicks: [],
        },
      };
    }

    const productsRes = await fetchProductsAction();
    const productsList = productsRes.data || [];
    const clicksRes = await fetchClicksAction();
    const clicksList = clicksRes.data || [];

    const totalClicks = clicksList.reduce((acc, c) => acc + (c.count || 1), 0);

    const productClickCounts: Record<string, number> = {};
    clicksList.forEach((c) => {
      productClickCounts[c.product_id] = (productClickCounts[c.product_id] || 0) + (c.count || 1);
    });

    const topClickedProducts = productsList
      .map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        clicks: productClickCounts[p.id] || p.clicks_count || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    return {
      success: true,
      data: {
        totalProducts: productsList.length,
        totalClicks,
        topClickedProducts,
        recentClicks: clicksList.slice(0, 10),
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message,
      data: {
        totalProducts: 0,
        totalClicks: 0,
        topClickedProducts: [],
        recentClicks: [],
      },
    };
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id?: string | null): boolean {
  return typeof id === "string" && UUID_REGEX.test(id.trim());
}

const VALID_COLLECTION_CATEGORIES: readonly CollectionCategory[] = [
  "Travel",
  "Beauty & Personal Care",
  "Electronics & Tech Accessories",
] as const;

const VALID_COLLECTION_STATUSES: readonly CollectionStatus[] = [
  "draft",
  "published",
  "archived",
] as const;

const VALID_SECTION_TYPES: readonly CollectionSectionType[] = [
  "narrative",
  "spotlight",
  "comparison",
  "checklist",
  "takeaway",
] as const;

function cleanCollectionSlug(rawSlug?: string | null, title?: string): string {
  const candidate = (rawSlug && rawSlug.trim()) || (title && title.trim()) || "collection";
  return candidate
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Normalizes a database row into canonical DbCollection format.
 */
function normalizeDbCollection(raw: any): DbCollection {
  return {
    id: raw.id,
    title: stripProductMeta(raw.title || "Curated Collection"),
    slug: cleanCollectionSlug(raw.slug, raw.title),
    description: stripProductMeta(raw.description || ""),
    cover_image_url: (raw.cover_image_url || "").trim(),
    category: VALID_COLLECTION_CATEGORIES.includes(raw.category) ? raw.category : "Travel",
    status: VALID_COLLECTION_STATUSES.includes(raw.status) ? raw.status : "draft",
    sort_order: typeof raw.sort_order === "number" && !isNaN(raw.sort_order) ? Math.floor(raw.sort_order) : 0,
    seo_title: raw.seo_title ? stripProductMeta(raw.seo_title) : null,
    seo_description: raw.seo_description ? stripProductMeta(raw.seo_description) : null,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
  };
}

/**
 * Normalizes a database row into canonical DbCollectionSection format.
 */
function normalizeDbCollectionSection(raw: any): DbCollectionSection {
  return {
    id: raw.id,
    collection_id: raw.collection_id,
    heading: stripProductMeta(raw.heading || "Section Heading"),
    body: stripProductMeta(raw.body || ""),
    image_url: raw.image_url ? String(raw.image_url).trim() : "",
    section_type: VALID_SECTION_TYPES.includes(raw.section_type) ? raw.section_type : "narrative",
    sort_order: typeof raw.sort_order === "number" && !isNaN(raw.sort_order) ? Math.floor(raw.sort_order) : 0,
    cta_text: raw.cta_text ? stripProductMeta(raw.cta_text) : null,
    cta_destination: raw.cta_destination ? String(raw.cta_destination).trim() : null,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
  };
}

/**
 * Normalizes a database row into canonical DbCollectionProduct format.
 */
function normalizeDbCollectionProduct(raw: any): DbCollectionProduct {
  const rawProduct = Array.isArray(raw.products)
    ? raw.products[0]
    : Array.isArray(raw.product)
    ? raw.product[0]
    : (raw.products || raw.product || null);

  return {
    id: raw.id,
    collection_id: raw.collection_id,
    product_id: raw.product_id,
    editorial_note: stripProductMeta(raw.editorial_note || ""),
    sort_order: typeof raw.sort_order === "number" && !isNaN(raw.sort_order) ? Math.floor(raw.sort_order) : 0,
    is_featured: Boolean(raw.is_featured),
    created_at: raw.created_at || new Date().toISOString(),
    product: rawProduct ? normalizeDbProduct(rawProduct) : undefined,
  };
}

/**
 * Server action to fetch all published editorial collections for public discovery.
 * Public SELECT access is permitted by Row Level Security on published collections.
 * Drafts and archived collections are never exposed to public callers.
 */
export async function fetchPublishedCollectionsAction(): Promise<{
  success: boolean;
  data: DbCollection[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("collections")
      .select("id, title, slug, description, cover_image_url, category, status, sort_order, seo_title, seo_description, created_at, updated_at")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetchPublishedCollectionsAction error:", error.message);
      return { success: false, data: [], error: error.message };
    }

    if (!Array.isArray(data)) {
      return { success: true, data: [] };
    }

    const collections = data.map(normalizeDbCollection);
    return { success: true, data: collections };
  } catch (err: any) {
    console.error("fetchPublishedCollectionsAction exception:", err);
    return { success: false, data: [], error: err?.message || "Failed to load published collections." };
  }
}

/**
 * Server action to fetch a single published editorial collection by slug,
 * including its ordered sections/slides and associated existing products.
 * Uses a single nested Supabase query to prevent N+1 queries.
 * Returns a clean not-found response (data: null) if missing, draft, or archived.
 */
export async function fetchCollectionBySlugAction(
  slug: string
): Promise<{
  success: boolean;
  data: CollectionWithRelations | null;
  error?: string;
}> {
  try {
    const cleanSlug = (slug || "").trim().toLowerCase();
    if (!cleanSlug) {
      return { success: false, data: null, error: "Invalid collection slug." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("collections")
      .select(`
        id,
        title,
        slug,
        description,
        cover_image_url,
        category,
        status,
        sort_order,
        seo_title,
        seo_description,
        created_at,
        updated_at,
        collection_sections (
          id,
          collection_id,
          heading,
          body,
          image_url,
          section_type,
          sort_order,
          cta_text,
          cta_destination,
          created_at,
          updated_at
        ),
        collection_products (
          id,
          collection_id,
          product_id,
          editorial_note,
          sort_order,
          is_featured,
          created_at,
          products (*)
        )
      `)
      .eq("slug", cleanSlug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.warn("Supabase fetchCollectionBySlugAction error:", error.message);
      return { success: false, data: null, error: error.message };
    }

    if (!data) {
      return { success: true, data: null };
    }

    const baseCollection = normalizeDbCollection(data);

    // Normalize and sort sections by sort_order ascending
    const rawSections = (data as any).collection_sections || [];
    const sections: DbCollectionSection[] = (Array.isArray(rawSections) ? rawSections : [])
      .map((s: any) => ({
        id: s.id,
        collection_id: s.collection_id,
        heading: stripProductMeta(s.heading || ""),
        body: stripProductMeta(s.body || ""),
        image_url: s.image_url ? String(s.image_url).trim() : "",
        section_type: s.section_type || "narrative",
        sort_order: typeof s.sort_order === "number" ? s.sort_order : 0,
        cta_text: s.cta_text ? stripProductMeta(s.cta_text) : null,
        cta_destination: s.cta_destination ? String(s.cta_destination).trim() : null,
        created_at: s.created_at,
        updated_at: s.updated_at,
      }))
      .sort((a, b) => a.sort_order - b.sort_order);

    // Normalize and sort collection products by sort_order ascending
    const rawProducts = (data as any).collection_products || [];
    const collectionProducts: DbCollectionProduct[] = (Array.isArray(rawProducts) ? rawProducts : [])
      .map((cp: any) => {
        const rawProduct = Array.isArray(cp.products)
          ? cp.products[0]
          : Array.isArray(cp.product)
          ? cp.product[0]
          : (cp.products || cp.product || null);

        const normalizedProduct: DbProduct | undefined = rawProduct
          ? normalizeDbProduct(rawProduct)
          : undefined;

        return {
          id: cp.id,
          collection_id: cp.collection_id,
          product_id: cp.product_id,
          editorial_note: stripProductMeta(cp.editorial_note || ""),
          sort_order: typeof cp.sort_order === "number" ? cp.sort_order : 0,
          is_featured: Boolean(cp.is_featured),
          created_at: cp.created_at,
          product: normalizedProduct,
        };
      })
      .sort((a, b) => a.sort_order - b.sort_order);

    const fullCollection: CollectionWithRelations = {
      ...baseCollection,
      sections,
      collection_products: collectionProducts,
    };

    return { success: true, data: fullCollection };
  } catch (err: any) {
    console.error("fetchCollectionBySlugAction exception:", err);
    return { success: false, data: null, error: err?.message || "Failed to load collection." };
  }
}

/**
 * Server action to fetch all collections for administrative management.
 * Protected by requireAdmin() and RLS.
 */
export async function fetchAdminCollectionsAction(): Promise<{
  success: boolean;
  data: DbCollection[];
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, data: [], error: authCheck.error };
    }
    const { supabase } = authCheck;

    const { data, error } = await supabase
      .from("collections")
      .select("id, title, slug, description, cover_image_url, category, status, sort_order, seo_title, seo_description, created_at, updated_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetchAdminCollectionsAction error:", error.message);
      return { success: false, data: [], error: error.message };
    }

    const collections = (Array.isArray(data) ? data : []).map(normalizeDbCollection);
    return { success: true, data: collections };
  } catch (err: any) {
    console.error("fetchAdminCollectionsAction exception:", err);
    return { success: false, data: [], error: err?.message || "Failed to load collections." };
  }
}

/**
 * Server action to fetch a single editorial collection by ID with full relations
 * (ordered sections and associated products with canonical product details)
 * for administrative management and editing.
 * Does NOT restrict status, allowing draft, published, and archived collections to be retrieved.
 * Protected by requireAdmin() and database RLS.
 */
export async function fetchAdminCollectionDetailsAction(
  id: string
): Promise<{
  success: boolean;
  data: CollectionWithRelations | null;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, data: null, error: authCheck.error };
    }
    const { supabase } = authCheck;

    if (!isValidUuid(id)) {
      return { success: false, data: null, error: "Invalid collection ID format." };
    }

    const { data, error } = await supabase
      .from("collections")
      .select(`
        id,
        title,
        slug,
        description,
        cover_image_url,
        category,
        status,
        sort_order,
        seo_title,
        seo_description,
        created_at,
        updated_at,
        collection_sections (
          id,
          collection_id,
          heading,
          body,
          image_url,
          section_type,
          sort_order,
          cta_text,
          cta_destination,
          created_at,
          updated_at
        ),
        collection_products (
          id,
          collection_id,
          product_id,
          editorial_note,
          sort_order,
          is_featured,
          created_at,
          products (*)
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Supabase fetchAdminCollectionDetailsAction error:", error.message);
      return { success: false, data: null, error: error.message };
    }

    if (!data) {
      return { success: false, data: null, error: "Collection not found." };
    }

    const baseCollection = normalizeDbCollection(data);

    // Normalize and sort sections by sort_order ascending
    const rawSections = (data as any).collection_sections || [];
    const sections: DbCollectionSection[] = (Array.isArray(rawSections) ? rawSections : [])
      .map(normalizeDbCollectionSection)
      .sort((a, b) => a.sort_order - b.sort_order);

    // Normalize and sort collection products by sort_order ascending
    const rawProducts = (data as any).collection_products || [];
    const collectionProducts: DbCollectionProduct[] = (Array.isArray(rawProducts) ? rawProducts : [])
      .map(normalizeDbCollectionProduct)
      .sort((a, b) => a.sort_order - b.sort_order);

    const fullCollection: CollectionWithRelations = {
      ...baseCollection,
      sections,
      collection_products: collectionProducts,
    };

    return { success: true, data: fullCollection };
  } catch (err: any) {
    console.error("fetchAdminCollectionDetailsAction exception:", err);
    return { success: false, data: null, error: err?.message || "Failed to load collection details." };
  }
}

/**
 * Server action to create a new editorial collection.
 * Protected by requireAdmin() and database RLS.
 */
export async function createCollectionAction(
  collectionData: Omit<NewDbCollection, "slug"> & { slug?: string }
): Promise<{
  success: boolean;
  data?: DbCollection;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    const title = stripProductMeta(collectionData.title || "").trim();
    if (!title) {
      return { success: false, error: "Collection title is required." };
    }

    const slug = cleanCollectionSlug(collectionData.slug, title);
    if (!slug) {
      return { success: false, error: "A valid URL slug is required." };
    }

    const category = (collectionData.category || "Travel").trim() as any;
    if (!VALID_COLLECTION_CATEGORIES.includes(category)) {
      return {
        success: false,
        error: `Invalid category. Must be one of: ${VALID_COLLECTION_CATEGORIES.join(", ")}.`,
      };
    }

    const status = (collectionData.status || "draft").trim() as any;
    if (!VALID_COLLECTION_STATUSES.includes(status)) {
      return {
        success: false,
        error: `Invalid status. Must be one of: ${VALID_COLLECTION_STATUSES.join(", ")}.`,
      };
    }

    const sortOrder =
      typeof collectionData.sort_order === "number" && !isNaN(collectionData.sort_order)
        ? Math.floor(collectionData.sort_order)
        : 0;

    const payload = {
      title,
      slug,
      description: stripProductMeta(collectionData.description || ""),
      cover_image_url: (collectionData.cover_image_url || "").trim(),
      category,
      status,
      sort_order: sortOrder,
      seo_title: collectionData.seo_title ? stripProductMeta(collectionData.seo_title) : null,
      seo_description: collectionData.seo_description
        ? stripProductMeta(collectionData.seo_description)
        : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("collections")
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (
        error.code === "23505" ||
        error.message.toLowerCase().includes("unique") ||
        error.message.toLowerCase().includes("duplicate")
      ) {
        return {
          success: false,
          error: `A collection with the slug "${slug}" already exists. Please choose a unique slug.`,
        };
      }
      console.error("Supabase createCollectionAction error:", error.message);
      return { success: false, error: error.message || "Failed to create collection." };
    }

    const normalized = normalizeDbCollection(data);

    revalidatePath("/secure-admin-panel");
    revalidatePath("/collections");
    revalidatePath(`/collections/${normalized.slug}`);

    return { success: true, data: normalized };
  } catch (err: any) {
    console.error("createCollectionAction exception:", err);
    return { success: false, error: err?.message || "Failed to create collection." };
  }
}

/**
 * Server action to update an existing editorial collection.
 * Protected by requireAdmin() and database RLS.
 */
export async function updateCollectionAction(
  id: string,
  collectionData: Partial<DbCollection>
): Promise<{
  success: boolean;
  data?: DbCollection;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    if (!isValidUuid(id)) {
      return { success: false, error: "Invalid collection ID format." };
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (collectionData.title !== undefined) {
      const cleanTitle = stripProductMeta(collectionData.title).trim();
      if (!cleanTitle) {
        return { success: false, error: "Collection title cannot be empty." };
      }
      updates.title = cleanTitle;
    }

    if (collectionData.slug !== undefined) {
      const cleanSlug = cleanCollectionSlug(collectionData.slug);
      if (!cleanSlug) {
        return { success: false, error: "Collection slug cannot be empty." };
      }
      updates.slug = cleanSlug;
    }

    if (collectionData.description !== undefined) {
      updates.description = stripProductMeta(collectionData.description);
    }

    if (collectionData.cover_image_url !== undefined) {
      updates.cover_image_url = (collectionData.cover_image_url || "").trim();
    }

    if (collectionData.category !== undefined) {
      const cat = collectionData.category.trim() as any;
      if (!VALID_COLLECTION_CATEGORIES.includes(cat)) {
        return {
          success: false,
          error: `Invalid category. Must be one of: ${VALID_COLLECTION_CATEGORIES.join(", ")}.`,
        };
      }
      updates.category = cat;
    }

    if (collectionData.status !== undefined) {
      const stat = collectionData.status.trim() as any;
      if (!VALID_COLLECTION_STATUSES.includes(stat)) {
        return {
          success: false,
          error: `Invalid status. Must be one of: ${VALID_COLLECTION_STATUSES.join(", ")}.`,
        };
      }
      updates.status = stat;
    }

    if (collectionData.sort_order !== undefined) {
      const sort = Number(collectionData.sort_order);
      updates.sort_order = isNaN(sort) ? 0 : Math.floor(sort);
    }

    if (collectionData.seo_title !== undefined) {
      updates.seo_title = collectionData.seo_title ? stripProductMeta(collectionData.seo_title) : null;
    }

    if (collectionData.seo_description !== undefined) {
      updates.seo_description = collectionData.seo_description
        ? stripProductMeta(collectionData.seo_description)
        : null;
    }

    const { data, error } = await supabase
      .from("collections")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      if (
        error.code === "23505" ||
        error.message.toLowerCase().includes("unique") ||
        error.message.toLowerCase().includes("duplicate")
      ) {
        return {
          success: false,
          error: "A collection with this slug already exists. Please choose a unique slug.",
        };
      }
      console.error("Supabase updateCollectionAction error:", error.message);
      return { success: false, error: error.message || "Failed to update collection." };
    }

    if (!data) {
      return { success: false, error: "Collection not found." };
    }

    const normalized = normalizeDbCollection(data);

    revalidatePath("/secure-admin-panel");
    revalidatePath("/collections");
    revalidatePath(`/collections/${normalized.slug}`);

    return { success: true, data: normalized };
  } catch (err: any) {
    console.error("updateCollectionAction exception:", err);
    return { success: false, error: err?.message || "Failed to update collection." };
  }
}

/**
 * Server action to quickly change collection status among draft, published, and archived.
 * Protected by requireAdmin() and database RLS.
 */
export async function updateCollectionStatusAction(
  id: string,
  status: CollectionStatus
): Promise<{
  success: boolean;
  data?: DbCollection;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    if (!isValidUuid(id)) {
      return { success: false, error: "Invalid collection ID format." };
    }

    if (!VALID_COLLECTION_STATUSES.includes(status)) {
      return {
        success: false,
        error: `Invalid status. Must be one of: ${VALID_COLLECTION_STATUSES.join(", ")}.`,
      };
    }

    const { data, error } = await supabase
      .from("collections")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase updateCollectionStatusAction error:", error.message);
      return { success: false, error: error.message || "Failed to update status." };
    }

    if (!data) {
      return { success: false, error: "Collection not found." };
    }

    const normalized = normalizeDbCollection(data);

    revalidatePath("/secure-admin-panel");
    revalidatePath("/collections");
    revalidatePath(`/collections/${normalized.slug}`);

    return { success: true, data: normalized };
  } catch (err: any) {
    console.error("updateCollectionStatusAction exception:", err);
    return { success: false, error: err?.message || "Failed to update collection status." };
  }
}

/**
 * Server action to delete an editorial collection.
 * Cascades on database level to delete child sections and product associations.
 * Protected by requireAdmin() and database RLS.
 */
export async function deleteCollectionAction(
  id: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    if (!isValidUuid(id)) {
      return { success: false, error: "Invalid collection ID format." };
    }

    // Retrieve slug for path cache revalidation
    const { data: existing } = await supabase
      .from("collections")
      .select("slug")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase deleteCollectionAction error:", error.message);
      return { success: false, error: error.message || "Failed to delete collection." };
    }

    revalidatePath("/secure-admin-panel");
    revalidatePath("/collections");
    if (existing?.slug) {
      revalidatePath(`/collections/${existing.slug}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error("deleteCollectionAction exception:", err);
    return { success: false, error: err?.message || "Failed to delete collection." };
  }
}

/**
 * Server action to create an editorial section inside a collection.
 * Protected by requireAdmin() and database RLS.
 */
export async function createCollectionSectionAction(
  collectionId: string,
  sectionData: Omit<NewDbCollectionSection, "collection_id">
): Promise<{
  success: boolean;
  data?: DbCollectionSection;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    if (!isValidUuid(collectionId)) {
      return { success: false, error: "Invalid parent collection ID format." };
    }

    // Verify parent collection exists
    const { data: parentCollection, error: parentErr } = await supabase
      .from("collections")
      .select("id, slug")
      .eq("id", collectionId)
      .maybeSingle();

    if (parentErr || !parentCollection) {
      return { success: false, error: "Parent collection not found." };
    }

    const heading = stripProductMeta(sectionData.heading || "").trim();
    if (!heading) {
      return { success: false, error: "Section heading is required." };
    }

    const sectionType = (sectionData.section_type || "narrative").trim() as any;
    if (!VALID_SECTION_TYPES.includes(sectionType)) {
      return {
        success: false,
        error: `Invalid section type. Must be one of: ${VALID_SECTION_TYPES.join(", ")}.`,
      };
    }

    const sortOrder =
      typeof sectionData.sort_order === "number" && !isNaN(sectionData.sort_order)
        ? Math.floor(sectionData.sort_order)
        : 0;

    const payload = {
      collection_id: collectionId,
      heading,
      body: stripProductMeta(sectionData.body || ""),
      image_url: (sectionData.image_url || "").trim(),
      section_type: sectionType,
      sort_order: sortOrder,
      cta_text: sectionData.cta_text ? stripProductMeta(sectionData.cta_text) : null,
      cta_destination: sectionData.cta_destination ? String(sectionData.cta_destination).trim() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("collection_sections")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Supabase createCollectionSectionAction error:", error.message);
      return { success: false, error: error.message || "Failed to create section." };
    }

    const normalized = normalizeDbCollectionSection(data);

    revalidatePath("/secure-admin-panel");
    revalidatePath(`/collections/${parentCollection.slug}`);

    return { success: true, data: normalized };
  } catch (err: any) {
    console.error("createCollectionSectionAction exception:", err);
    return { success: false, error: err?.message || "Failed to create section." };
  }
}

/**
 * Server action to update an existing editorial section.
 * Protected by requireAdmin() and database RLS.
 */
export async function updateCollectionSectionAction(
  sectionId: string,
  sectionData: Partial<DbCollectionSection>
): Promise<{
  success: boolean;
  data?: DbCollectionSection;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    if (!isValidUuid(sectionId)) {
      return { success: false, error: "Invalid section ID format." };
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (sectionData.heading !== undefined) {
      const cleanHeading = stripProductMeta(sectionData.heading).trim();
      if (!cleanHeading) {
        return { success: false, error: "Section heading cannot be empty." };
      }
      updates.heading = cleanHeading;
    }

    if (sectionData.body !== undefined) {
      updates.body = stripProductMeta(sectionData.body);
    }

    if (sectionData.image_url !== undefined) {
      updates.image_url = (sectionData.image_url || "").trim();
    }

    if (sectionData.section_type !== undefined) {
      const st = sectionData.section_type.trim() as any;
      if (!VALID_SECTION_TYPES.includes(st)) {
        return {
          success: false,
          error: `Invalid section type. Must be one of: ${VALID_SECTION_TYPES.join(", ")}.`,
        };
      }
      updates.section_type = st;
    }

    if (sectionData.sort_order !== undefined) {
      const sort = Number(sectionData.sort_order);
      updates.sort_order = isNaN(sort) ? 0 : Math.floor(sort);
    }

    if (sectionData.cta_text !== undefined) {
      updates.cta_text = sectionData.cta_text ? stripProductMeta(sectionData.cta_text) : null;
    }

    if (sectionData.cta_destination !== undefined) {
      updates.cta_destination = sectionData.cta_destination ? String(sectionData.cta_destination).trim() : null;
    }

    const { data, error } = await supabase
      .from("collection_sections")
      .update(updates)
      .eq("id", sectionId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase updateCollectionSectionAction error:", error.message);
      return { success: false, error: error.message || "Failed to update section." };
    }

    if (!data) {
      return { success: false, error: "Section not found." };
    }

    const normalized = normalizeDbCollectionSection(data);

    revalidatePath("/secure-admin-panel");

    return { success: true, data: normalized };
  } catch (err: any) {
    console.error("updateCollectionSectionAction exception:", err);
    return { success: false, error: err?.message || "Failed to update section." };
  }
}

/**
 * Server action to delete an editorial section.
 * Protected by requireAdmin() and database RLS.
 */
export async function deleteCollectionSectionAction(
  sectionId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    if (!isValidUuid(sectionId)) {
      return { success: false, error: "Invalid section ID format." };
    }

    const { error } = await supabase
      .from("collection_sections")
      .delete()
      .eq("id", sectionId);

    if (error) {
      console.error("Supabase deleteCollectionSectionAction error:", error.message);
      return { success: false, error: error.message || "Failed to delete section." };
    }

    revalidatePath("/secure-admin-panel");

    return { success: true };
  } catch (err: any) {
    console.error("deleteCollectionSectionAction exception:", err);
    return { success: false, error: err?.message || "Failed to delete section." };
  }
}

/**
 * Server action to reorder sections within a collection.
 * Protected by requireAdmin() and database RLS.
 */
export async function reorderCollectionSectionsAction(
  collectionId: string,
  sectionOrders: Array<{ id: string; sort_order: number }>
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    if (!isValidUuid(collectionId)) {
      return { success: false, error: "Invalid collection ID format." };
    }

    if (!Array.isArray(sectionOrders) || sectionOrders.length === 0) {
      return { success: false, error: "Section orders array is required." };
    }

    for (const item of sectionOrders) {
      if (!isValidUuid(item.id)) {
        return { success: false, error: `Invalid section ID: ${item.id}` };
      }
      const sort = typeof item.sort_order === "number" && !isNaN(item.sort_order) ? Math.floor(item.sort_order) : 0;
      const { error } = await supabase
        .from("collection_sections")
        .update({ sort_order: sort, updated_at: new Date().toISOString() })
        .eq("id", item.id)
        .eq("collection_id", collectionId);

      if (error) {
        console.error("Supabase reorderCollectionSectionsAction item error:", error.message);
        return { success: false, error: error.message };
      }
    }

    revalidatePath("/secure-admin-panel");

    return { success: true };
  } catch (err: any) {
    console.error("reorderCollectionSectionsAction exception:", err);
    return { success: false, error: err?.message || "Failed to reorder sections." };
  }
}

/**
 * Server action to attach an existing product to an editorial collection.
 * Never creates or modifies the underlying product record.
 * Prevents duplicate associations and returns a clear error.
 * Protected by requireAdmin() and database RLS.
 */
export async function addCollectionProductAction(
  collectionId: string,
  productId: string,
  options?: {
    editorial_note?: string;
    sort_order?: number;
    is_featured?: boolean;
  }
): Promise<{
  success: boolean;
  data?: DbCollectionProduct;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    if (!isValidUuid(collectionId)) {
      return { success: false, error: "Invalid collection ID format." };
    }
    if (!isValidUuid(productId)) {
      return { success: false, error: "Invalid product ID format." };
    }

    // 1. Verify parent collection exists
    const { data: parentCollection, error: parentErr } = await supabase
      .from("collections")
      .select("id, slug")
      .eq("id", collectionId)
      .maybeSingle();

    if (parentErr || !parentCollection) {
      return { success: false, error: "Target collection not found." };
    }

    // 2. Verify product exists in canonical products table
    const { data: productRow, error: prodErr } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (prodErr || !productRow) {
      return { success: false, error: "Product not found in catalogue." };
    }

    // 3. Prevent duplicate association
    const { data: existingAssoc } = await supabase
      .from("collection_products")
      .select("id")
      .eq("collection_id", collectionId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingAssoc) {
      return {
        success: false,
        error: "This product is already associated with this collection.",
      };
    }

    const sortOrder =
      typeof options?.sort_order === "number" && !isNaN(options.sort_order)
        ? Math.floor(options.sort_order)
        : 0;

    const payload = {
      collection_id: collectionId,
      product_id: productId,
      editorial_note: stripProductMeta(options?.editorial_note || ""),
      sort_order: sortOrder,
      is_featured: Boolean(options?.is_featured),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("collection_products")
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (
        error.code === "23505" ||
        error.message.toLowerCase().includes("unique") ||
        error.message.toLowerCase().includes("uq_collection_product")
      ) {
        return {
          success: false,
          error: "This product is already associated with this collection.",
        };
      }
      console.error("Supabase addCollectionProductAction error:", error.message);
      return { success: false, error: error.message || "Failed to associate product." };
    }

    const normalized = normalizeDbCollectionProduct(data);

    revalidatePath("/secure-admin-panel");
    revalidatePath(`/collections/${parentCollection.slug}`);

    return { success: true, data: normalized };
  } catch (err: any) {
    console.error("addCollectionProductAction exception:", err);
    return { success: false, error: err?.message || "Failed to associate product." };
  }
}

/**
 * Server action to update an existing product association within a collection.
 * Modifies only junction metadata (editorial_note, is_featured, sort_order).
 * Never modifies the underlying product record.
 * Protected by requireAdmin() and database RLS.
 */
export async function updateCollectionProductAction(
  associationId: string,
  options: {
    editorial_note?: string;
    sort_order?: number;
    is_featured?: boolean;
  }
): Promise<{
  success: boolean;
  data?: DbCollectionProduct;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    if (!isValidUuid(associationId)) {
      return { success: false, error: "Invalid association ID format." };
    }

    const updates: Record<string, any> = {};

    if (options.editorial_note !== undefined) {
      updates.editorial_note = stripProductMeta(options.editorial_note);
    }

    if (options.sort_order !== undefined) {
      const sort = Number(options.sort_order);
      updates.sort_order = isNaN(sort) ? 0 : Math.floor(sort);
    }

    if (options.is_featured !== undefined) {
      updates.is_featured = Boolean(options.is_featured);
    }

    const { data, error } = await supabase
      .from("collection_products")
      .update(updates)
      .eq("id", associationId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase updateCollectionProductAction error:", error.message);
      return { success: false, error: error.message || "Failed to update association." };
    }

    if (!data) {
      return { success: false, error: "Product association not found." };
    }

    const normalized = normalizeDbCollectionProduct(data);

    revalidatePath("/secure-admin-panel");

    return { success: true, data: normalized };
  } catch (err: any) {
    console.error("updateCollectionProductAction exception:", err);
    return { success: false, error: err?.message || "Failed to update association." };
  }
}

/**
 * Server action to remove a product association from a collection.
 * Never deletes or modifies the underlying product record.
 * Protected by requireAdmin() and database RLS.
 */
export async function removeCollectionProductAction(
  associationId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }
    const { supabase } = authCheck;

    if (!isValidUuid(associationId)) {
      return { success: false, error: "Invalid association ID format." };
    }

    const { error } = await supabase
      .from("collection_products")
      .delete()
      .eq("id", associationId);

    if (error) {
      console.error("Supabase removeCollectionProductAction error:", error.message);
      return { success: false, error: error.message || "Failed to remove product from collection." };
    }

    revalidatePath("/secure-admin-panel");

    return { success: true };
  } catch (err: any) {
    console.error("removeCollectionProductAction exception:", err);
    return { success: false, error: err?.message || "Failed to remove product from collection." };
  }
}

