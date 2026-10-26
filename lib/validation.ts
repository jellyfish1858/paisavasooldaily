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
