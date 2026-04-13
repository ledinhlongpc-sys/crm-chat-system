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

   /* =========================
       BODY
    ========================== */

    const body = await req.json();

    const {
      id: order_id,
      branch_id,
      customer_id,
      expected_delivery_at,
      order_source,
      note,
      order_discount_amount,
      items,
      costs,
      payments,
      address_snapshot,
    } = body;

    /* =========================
       VALIDATION
    ========================== */

    if (!order_id) {
      return NextResponse.json(
        { error: "Thiếu order_id" },
        { status: 400 }
      );
    }

    if (!branch_id || !order_source) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Đơn hàng phải có ít nhất 1 sản phẩm" },
        { status: 400 }
      );
    }

    /* =========================
       CHECK TRẠNG THÁI
    ========================== */

    const { data: order, error: orderError } = await supabase
      .from("system_sales_orders")
      .select("fulfillment_status")
      .eq("tenant_id", tenant_id)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    const allowEditStatus = ["unfulfilled", "preparing"];

    if (!allowEditStatus.includes(order.fulfillment_status)) {
      return NextResponse.json(
        {
          error:
            "Đơn đã đóng gói hoặc đang giao, không thể chỉnh sửa. Chỉ có thể hủy.",
        },
        { status: 400 }
      );
    }

    /* =========================
       HEADER (CHUẨN)
    ========================== */

    const header = {
      branch_id,
      customer_id,
      order_source,
      note: (note ?? "").trim() || null,

      expected_delivery_at: expected_delivery_at
        ? new Date(expected_delivery_at).toISOString()
        : null,

      order_discount_amount: order_discount_amount ?? 0,

      address_snapshot: address_snapshot ?? null,
    };

    /* =========================
       CALL RPC UPDATE
    ========================== */

    const { error } = await supabase.rpc("sales_order_update", {
      p_tenant_id: tenant_id,
      p_order_id: order_id,
      p_header: header,
      p_items: items,
      p_costs: costs ?? [],
      p_payments: payments ?? [],
    });

    if (error) {
      const message = error.message || "";

      if (message.includes("Không đủ tồn kho")) {
        return NextResponse.json(
          {
            error:
              "Không đủ tồn kho cho một hoặc nhiều sản phẩm",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: message || "UPDATE_FAILED" },
        { status: 500 }
      );
    }

/* 🔥 LẤY LẠI ORDER_CODE */

const { data: orderRow } = await supabase
  .from("system_sales_orders")
  .select("order_code")
  .eq("tenant_id", tenant_id)
  .eq("id", order_id)
  .single();

    /* =========================
       SUCCESS
    ========================== */
  return NextResponse.json({
  success: true,
  order_id,
  order_code: orderRow?.order_code,
});

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}