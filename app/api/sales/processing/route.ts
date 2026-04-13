import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const { order_code } = body;

    /* =========================
       VALIDATION
    ========================== */

    if (!order_code) {
      return NextResponse.json(
        { error: "Thiếu order_code" },
        { status: 400 }
      );
    }

    /* =========================
       CALL RPC (CONFIRM PROCESSING)
    ========================== */

    const { data: order_id, error } = await supabase.rpc(
      "sales_order_confirm_processing",
      {
        p_tenant_id: tenant_id,
        p_order_code: order_code,
      }
    );

    if (error || !order_id) {
      const message = error?.message || "";

      if (message.includes("Không đủ tồn kho")) {
        return NextResponse.json(
          { error: "Không đủ tồn kho cho một hoặc nhiều sản phẩm" },
          { status: 400 }
        );
      }

      if (message.includes("draft")) {
        return NextResponse.json(
          { error: "Đơn hàng không ở trạng thái nháp" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: message || "CONFIRM_PROCESSING_FAILED" },
        { status: 500 }
      );
    }

    /* =========================
       GET ORDER CODE
    ========================== */

    const { data: orderData, error: fetchError } = await supabase
      .from("system_sales_orders")
      .select("order_code")
      .eq("id", order_id)
      .single();

    if (fetchError || !orderData) {
      return NextResponse.json(
        { error: "Không thể lấy mã đơn hàng" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order_id,
      order_code: orderData.order_code,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}