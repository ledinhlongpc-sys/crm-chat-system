// app/api/purchases/create_complete/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/purchases/create_complete
   - Nhận payload từ FE
   - Gọi RPC purchase_order_create_and_complete_full
   - Trả về order_id + order_code (+ status)
====================================================== */

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT CONTEXT ================= */
    await getTenantId(supabase);

    /* ================= PARSE BODY ================= */
    const body = await req.json();

    if (!body) {
      return NextResponse.json(
        { error: "Payload không hợp lệ" },
        { status: 400 }
      );
    }

    // Debug nhẹ (không crash nếu undefined)
    console.log(
      "[CREATE_COMPLETE PURCHASE] items:",
      body?.items?.length ?? 0
    );
    console.log(
      "[CREATE_COMPLETE PURCHASE] costs:",
      body?.costs?.length ?? 0,
      body?.costs
    );
    console.log(
      "[CREATE_COMPLETE PURCHASE] payments:",
      body?.payments?.length ?? 0,
      body?.payments
    );

    /* ================= CALL RPC ================= */
    const { data, error } = await supabase.rpc(
      "purchase_order_create_and_complete_full",
      { p_payload: body }
    );

    if (error) {
      console.error("Create+complete purchase RPC error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data?.order_id) {
      return NextResponse.json(
        { error: "Tạo & nhập kho thất bại" },
        { status: 500 }
      );
    }

    /* ================= SUCCESS ================= */
    return NextResponse.json(
      {
        order_id: data.order_id,
        order_code: data.order_code,
        status: data.status ?? "completed",
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

    if (err?.message === "BRANCH_REQUIRED") {
      return NextResponse.json(
        { error: "Chưa chọn chi nhánh" },
        { status: 400 }
      );
    }

    console.error("Create+complete purchase API error:", err);

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}