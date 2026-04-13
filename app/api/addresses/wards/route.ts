import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== QUERY ===== */
    const { searchParams } = new URL(req.url);
    const district_code = searchParams.get("district_code")?.trim();

    if (!district_code) {
      return NextResponse.json(
        { error: "Thiếu district_code" },
        { status: 400 }
      );
    }

    /* ===== QUERY WARDS ===== */
    const { data, error } = await supabase
      .from("system_address_wards_v1")
      .select("code, name")
      .eq("district_code", district_code)
      .order("name");

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
