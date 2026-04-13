import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/purchases/create
   - Nhận payload từ FE
   - Gọi RPC purchase_order_create_full
   - Trả về order_id + order_code
====================================================== */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT CONTEXT ================= */
    await getTenantId(supabase); 
    // 👆 chỉ cần verify login + tenant tồn tại
    // function DB đã tự lấy tenant rồi

    /* ================= PARSE BODY ================= */
    const body = await req.json();

    if (!body) {
      return NextResponse.json(
        { error: "Payload không hợp lệ" },
        { status: 400 }
      );
    }
	

console.log("[CREATE PURCHASE] costs:", body?.costs?.length, body?.costs);
console.log("[CREATE PURCHASE] payments:", body?.payments?.length, body?.payments);

    /* ================= CALL RPC ================= */
    const { data, error } = await supabase.rpc(
      "purchase_order_create_full",
      {
        p_payload: body,
      }
    );

    if (error) {
      console.error("Create purchase RPC error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data?.order_id) {
      return NextResponse.json(
        { error: "Tạo đơn nhập thất bại" },
        { status: 500 }
      );
    }

    /* ================= SUCCESS ================= */
    return NextResponse.json(
      {
        order_id: data.order_id,
        order_code: data.order_code,
      },
      { status: 201 }
    );

  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    console.error("Create purchase API error:", err);

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}