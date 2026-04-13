import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   GET /api/suppliers/supplier-groups
   - Lấy danh sách nhóm nhà cung cấp theo tenant
   - Chỉ lấy nhóm active
====================================================== */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT CONTEXT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= QUERY ================= */
    const { data, error } = await supabase
      .from("system_supplier_group")
      .select(
        `
        id,
        group_code,
        group_name,
        note,
        is_default,
        is_active,
        created_at
      `
      )
      .eq("tenant_id", tenant_id)
      .eq("is_active", true)
      .order("is_default", { ascending: false }) // default lên trước
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    /* ================= RESPONSE ================= */
    return NextResponse.json(
      {
        groups: data ?? [],
      },
      { status: 200 }
    );
  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
