import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= AUTH ================= */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    /* ================= TENANT ================= */

    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    /* ================= BODY ================= */

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Danh sách không hợp lệ" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    /* ================= SOFT DELETE PRODUCTS ================= */

    const { error } = await supabase
      .from("system_products")
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq("tenant_id", tenant_id)
      .in("id", ids);

    if (error) {
      console.error("DELETE PRODUCTS ERROR:", error);

      return NextResponse.json(
        { error: error.message || "Xóa thất bại" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted_count: ids.length,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}