import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== QUERY ===== */
    const { searchParams } = new URL(req.url);
    const province_code = searchParams.get("province_code")?.trim();

    if (!province_code) {
      return NextResponse.json(
        { error: "Thiếu province_code" },
        { status: 400 }
      );
    }

    /* ===== QUERY DISTRICTS ===== */
    const { data, error } = await supabase
      .from("system_address_districts_v1")
      .select("code, name")
      .eq("province_code", province_code)
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
