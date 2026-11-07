/**
 * Validation utilities for SmartChoice Storefront.
 */

/**
 * Validates YouTube URLs.
 * Standard youtube.com and youtu.be URLs only. Empty value is valid.
 */
export function isValidYouTubeUrl(url?: string | null): boolean {
  if (!url || !url.trim()) return true;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const isYouTube =
      host === "youtube.com" ||
      host === "www.youtube.com" ||
      host === "m.youtube.com" ||
      host.endsWith(".youtube.com");
    const isShortUrl = host === "youtu.be" || host.endsWith(".youtu.be");
    if (!isYouTube && !isShortUrl) return false;
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates Instagram URLs (Reels, Posts, etc.).
 * Empty value is valid.
 */
export function isValidInstagramUrl(url?: string | null): boolean {
  if (!url || !url.trim()) return true;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const isInstagram =
      host === "instagram.com" ||
      host === "www.instagram.com" ||
      host === "m.instagram.com" ||
      host === "instagr.am" ||
      host === "www.instagr.am" ||
      host.endsWith(".instagram.com") ||
      host.endsWith(".instagr.am");
    if (!isInstagram) return false;
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates Universal Media URLs (accepts YouTube OR Instagram; empty is valid).
 */
export function isValidUniversalMediaUrl(url?: string | null): boolean {
  if (!url || !url.trim()) return true;
  return isValidYouTubeUrl(url) || isValidInstagramUrl(url);
}

/**
 * Checks if a given URL is a YouTube URL.
 */
export function isYouTubeUrl(url?: string | null): boolean {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    return (
      host === "youtube.com" ||
      host === "www.youtube.com" ||
      host === "m.youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtu.be" ||
      host.endsWith(".youtu.be")
    );
  } catch {
    return false;
  }
}

/**
 * Checks if a given URL is an Instagram URL.
 */
export function isInstagramUrl(url?: string | null): boolean {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    return (
      host === "instagram.com" ||
      host === "www.instagram.com" ||
      host === "m.instagram.com" ||
      host === "instagr.am" ||
      host === "www.instagr.am" ||
      host.endsWith(".instagram.com") ||
      host.endsWith(".instagr.am")
    );
  } catch {
    return false;
  }
}

/**
 * Extracts clean YouTube embed URL from standard video, short, or shortened URL.
 */
export function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.includes("youtube.com/embed/")) return trimmed;
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  return null;
}

/**
 * Storage key for the First-Time Visitor Beauty Welcome Popup.
 */
export const BEAUTY_WELCOME_POPUP_STORAGE_KEY = "smartchoice_beauty_welcome_seen_v1";

/**
 * Extracts unmapped column names reported by PostgREST / Supabase schema cache errors.
 * e.g. "Could not find the 'is_out_of_stock' column of 'products' in the schema cache"
 */
export function extractUnmappedSchemaColumn(errorMessage?: string | null): string | null {
  if (!errorMessage || typeof errorMessage !== "string") return null;
  const match = errorMessage.match(/Could not find the '([^']+)' column of 'products' in the schema cache/i);
  return match && match[1] ? match[1] : null;
}

