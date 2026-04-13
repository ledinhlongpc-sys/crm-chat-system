

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/products/[id]/update
   - Cập nhật sản phẩm (EDIT)
   - Gọi RPC publish_product_update(payload)
   - Chuẩn tenant
====================================================== */

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    /* ================= PARAM ================= */
    const { id: productId } = await context.params;

    if (!productId) {
      return NextResponse.json(
        { error: "Thiếu productId" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    /* ================= TENANT CONTEXT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    const payload = await req.json();

    if (!payload || payload.product_id !== productId) {
      return NextResponse.json(
        { error: "Payload không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= CHECK PRODUCT ================= */
    const { data: product, error: productErr } =
      await supabase
        .from("system_products")
        .select("id")
        .eq("id", productId)
        .eq("tenant_id", tenant_id)
        .single();

    if (productErr || !product) {
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    /* ==================================================
       CALL RPC publish_product_update
       - RPC đã xử lý tenant ở DB layer
    ================================================== */
    const { error: rpcErr } = await supabase.rpc(
      "publish_product_update",
      {
        p_payload: payload, // ✅ 1 biến JSONB duy nhất
      }
    );

    if (rpcErr) {
      console.error(
        "RPC publish_product_update error:",
        rpcErr
      );
      return NextResponse.json(
        { error: rpcErr.message },
        { status: 500 }
      );
    }

    /* ================= SUCCESS ================= */
    return NextResponse.json(
      {
        success: true,
        updated_product_id: productId,
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

    console.error("UPDATE product error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
