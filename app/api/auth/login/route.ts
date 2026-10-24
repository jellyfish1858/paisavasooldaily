import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: "Please provide both an email and password." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    // Verify role in public.admin_users
    const { data: adminRecord, error: adminErr } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminErr || !adminRecord) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Access Denied: This account does not have administrator privileges." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (err: any) {
    console.error("API login error:", err);
    return NextResponse.json(
      { error: "Internal server authentication error" },
      { status: 500 }
    );
  }
}