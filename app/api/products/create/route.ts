import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/products/create
   - Tạo product trống theo tenant
   - Tạo root variant
   - Trả product_code để redirect sang trang edit
====================================================== */
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT CONTEXT =================
       - Resolve tenant_id theo chủ cửa hàng
       - Throw nếu chưa login hoặc chưa setup shop
    =================================================== */
    const tenant_id = await getTenantId(supabase);

    /* ============ CALL RPC =================
       rpc_create_empty_product
       - bên trong RPC dùng tenant_id
    ======================================= */
    const { data, error } = await supabase.rpc(
      "rpc_create_empty_product",
      {
        p_tenant_id: tenant_id, // 👈 nếu RPC đã sửa theo tenant
      }
    );

    if (error) {
      console.error("RPC error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data || !Array.isArray(data) || !data[0]) {
      return NextResponse.json(
        { error: "Create product failed" },
        { status: 500 }
      );
    }

    /* ============ RESPONSE ================= */
    return NextResponse.json(
      { product_code: data[0].product_code },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    console.error("Create product API error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
