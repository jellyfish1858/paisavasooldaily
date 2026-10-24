import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json(
      { error: "Supabase environment variables not configured" },
      { status: 500 }
    );
  }
  // Optional security check: if CRON_SECRET is configured, ensure Vercel Cron authorization header matches
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Extremely lightweight query: fetch only single product ID to ping the DB
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Keep-alive database query error:", error.message);
      return NextResponse.json(
        {
          success: false,
          message: "Keep-alive ping failed: database query error.",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supabase keep-alive ping successful. Project activity registered.",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Keep-alive unhandled error:", err?.message);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during keep-alive ping.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
