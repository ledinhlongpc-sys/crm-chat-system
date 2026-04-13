import { NextResponse } from "next/server";
import { createServerSupabaseClient } 
  from "@/lib/supabaseServer";

/* =========================
   GET /api/suppliers/group/options
   - Dùng cho dropdown chọn nhóm NCC
========================= */
export async function GET() {
  const supabase = await createServerSupabaseClient();

  /* ===== AUTH ===== */
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (!user || authErr) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    /* ===== QUERY OPTIONS ===== */
    const { data, error } = await supabase
      .from("system_supplier_group")
      .select("id, group_name")
      .eq("system_user_id", user.id)
      .order("group_name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json(
      { error: "Lỗi server" },
      { status: 500 }
    );
  }
}
