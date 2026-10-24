import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing required Supabase environment configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  let cookieStore: any = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Called outside of request scope (e.g. build-time SSG, sitemap generation).
    // Safely fallback to client without active request cookies for public queries.
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore ? cookieStore.getAll() : [];
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        if (!cookieStore) return;
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component during render.
          // This can be safely ignored if middleware/actions handle session refreshes.
        }
      },
    },
  });
}