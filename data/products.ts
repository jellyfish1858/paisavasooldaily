import type { DbProduct, QualitativeRating, ResearchSource } from "@/utils/supabase/types";

export type { QualitativeRating, ResearchSource };

export type BudgetTier = "low" | "mid" | "premium";
export type PriorityTag = "x" | "y";

export type Product = DbProduct & {
  imageUrl?: string;
  youtubeUrl?: string | null;
  retailerUrl?: string;
  retailerDomain?: string;
  amazonUrl?: string;
  budgetTier?: BudgetTier;
  priorityTag?: PriorityTag;
  reasonsToBuy?: string[];
  reasonsNotToBuy?: string[];
};

export const products: Product[] = [];
