export type QualitativeRating = "Strong" | "Good" | "Fair" | "Depends" | "Limited";

export type ResearchSource = {
  title: string;
  url?: string;
};

export type DbProduct = {
  // Identity
  id: string;
  title: string;
  slug?: string;
  category: string;
  badge?: string;
  description: string;
  image_url: string;
  video_url?: string;
  retailer_url: string;
  retailer_domain?: string;
  amazon_url?: string; // Backward-compatible alias for retailer_url

  // Content
  quick_take?: string;
  key_specs?: Record<string, string> | string[];
  strengths?: string[];
  trade_offs?: string[];
  good_for?: string[] | string;
  skip_if?: string[] | string;
  what_to_check?: string[] | string;
  final_take?: string;

  // Anti-Regret Matrix (Qualitative only - NO numerical scores)
  matrix_performance?: QualitativeRating | null;
  matrix_value?: QualitativeRating | null;
  matrix_ease_of_use?: QualitativeRating | null;
  matrix_portability?: QualitativeRating | null;
  matrix_compatibility?: QualitativeRating | null;
  matrix_long_term_suitability?: QualitativeRating | null;

  // Research
  research_basis?: string;
  research_sources?: Array<string | ResearchSource>;
  last_reviewed_at?: string | null;

  // Operational
  is_out_of_stock?: boolean;
  clicks_count?: number;
  created_at?: string;
  updated_at?: string;

  // Backward-compatible content aliases (mapped to strengths/trade_offs/final_take)
  verdict?: string;
  pros?: string[];
  cons?: string[];
  reasons_to_buy?: string[];
  reasons_not_to_buy?: string[];
};

export type NewDbProduct = Omit<DbProduct, "id" | "created_at" | "updated_at">;

// Canonical application Product type aliases DbProduct for unified type safety
export type Product = DbProduct;

// ----------------------------------------------------
// Editorial Collections Types
// ----------------------------------------------------

export type CollectionCategory =
  | "Travel"
  | "Beauty & Personal Care"
  | "Electronics & Tech Accessories";

export type CollectionStatus = "draft" | "published" | "archived";

export type CollectionSectionType =
  | "narrative"
  | "spotlight"
  | "comparison"
  | "checklist"
  | "takeaway";

export type DbCollection = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  category: CollectionCategory;
  status: CollectionStatus;
  sort_order: number;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type NewDbCollection = Omit<DbCollection, "id" | "created_at" | "updated_at">;

export type DbCollectionSection = {
  id: string;
  collection_id: string;
  heading: string;
  body: string;
  image_url?: string | null;
  section_type: CollectionSectionType;
  sort_order: number;
  cta_text?: string | null;
  cta_destination?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type NewDbCollectionSection = Omit<DbCollectionSection, "id" | "created_at" | "updated_at">;

export type DbCollectionProduct = {
  id: string;
  collection_id: string;
  product_id: string;
  editorial_note?: string | null;
  sort_order: number;
  is_featured: boolean;
  created_at?: string;
  product?: DbProduct;
};

export type NewDbCollectionProduct = Omit<DbCollectionProduct, "id" | "created_at">;

export type CollectionWithRelations = DbCollection & {
  sections: DbCollectionSection[];
  collection_products: DbCollectionProduct[];
};
