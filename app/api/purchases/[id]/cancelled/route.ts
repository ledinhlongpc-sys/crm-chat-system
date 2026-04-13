import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/purchases/[id]/cancelled
   - Hủy đơn draft
   - Gọi RPC purchase_order_cancel_draft
====================================================== */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT CONTEXT ================= */
    await getTenantId(supabase);
    // 👆 chỉ verify login + tenant tồn tại
    // DB function tự lấy tenant bằng get_my_tenant_id()

    /* ================= LẤY PARAMS (NEXT 15 FIX) ================= */
    const { id } = await context.params;
    const purchase_order_id = id;

    if (!purchase_order_id) {
      return NextResponse.json(
        { error: "Thiếu mã đơn nhập" },
        { status: 400 }
      );
    }

    /* ================= CALL RPC ================= */
    const { error } = await supabase.rpc(
      "purchase_order_cancel_draft",
      {
        p_order_id: purchase_order_id,
      }
    );

    if (error) {
      console.error("Cancel purchase RPC error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    /* ================= SUCCESS ================= */
    return NextResponse.json(
      {
        success: true,
        order_id: purchase_order_id,
        status: "cancelled",
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

    console.error("Cancel purchase API error:", err);

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}