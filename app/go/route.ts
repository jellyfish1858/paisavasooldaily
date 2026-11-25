import {
  KEYWORD_LINKS,
  findKeywordLink,
  buildAmazonSearchUrl,
  extractSearchQuery,
  type SupportedStore,
} from "../../lib/keyword-links.ts";

export const dynamic = "force-dynamic";

const AMAZON_TAG =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "jellyfish180c-21";

const REDIRECT_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const trimmedQ = extractSearchQuery(searchParams);

    // If q is empty, 302 redirect to the homepage
    if (!trimmedQ) {
      const homeUrl = new URL("/", request.url).toString();
      return new Response(null, {
        status: 302,
        headers: {
          Location: homeUrl,
          ...REDIRECT_HEADERS,
        },
      });
    }

    const rawStore = (searchParams.get("store") || "").toLowerCase().trim();
    const store: SupportedStore =
      rawStore === "flipkart" || rawStore === "meesho" ? rawStore : "amazon";

    // For Flipkart / Meesho: check KEYWORD_LINKS map
    if (store === "flipkart" || store === "meesho") {
      const storedLink = findKeywordLink(trimmedQ, store, KEYWORD_LINKS);
      if (storedLink) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: storedLink,
            ...REDIRECT_HEADERS,
          },
        });
      }
      // If no entry exists for that store, fall back to Amazon search redirect
    }

    // Amazon search redirect (default or fallback)
    const amazonUrl = buildAmazonSearchUrl(trimmedQ, AMAZON_TAG);
    return new Response(null, {
      status: 302,
      headers: {
        Location: amazonUrl,
        ...REDIRECT_HEADERS,
      },
    });
  } catch (error) {
    console.error("Error handling /go search redirect:", error);
    const homeUrl = new URL("/", request.url).toString();
    return new Response(null, {
      status: 302,
      headers: {
        Location: homeUrl,
        ...REDIRECT_HEADERS,
      },
    });
  }
}
