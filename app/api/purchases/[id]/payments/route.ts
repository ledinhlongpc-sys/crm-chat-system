import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/purchases/[id]/payments
   - Thêm thanh toán cho đơn nhập
   - Gọi RPC purchase_add_payment
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

    /* ================= PARSE BODY ================= */
    const body = await req.json();

    if (!body) {
      return NextResponse.json(
        { error: "Payload không hợp lệ" },
        { status: 400 }
      );
    }

    const { method, amount, paid_at, reference } = body;

    /* ================= BASIC VALIDATE ================= */
    if (!method) {
      return NextResponse.json(
        { error: "Thiếu phương thức thanh toán" },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Số tiền phải lớn hơn 0" },
        { status: 400 }
      );
    }

    /* ================= CALL RPC ================= */
    const { error } = await supabase.rpc(
      "purchase_add_payment",
      {
        p_purchase_order_id: purchase_order_id,
        p_method: method,
        p_amount: Number(amount),
        p_paid_at: paid_at
  ? new Date(paid_at).toISOString()
  : null,
        p_note: reference ?? null,
      }
    );

    if (error) {
      console.error("Add payment RPC error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    /* ================= SUCCESS ================= */
    return NextResponse.json(
      { success: true },
      { status: 201 }
    );

  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    console.error("Add payment API error:", err);

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}