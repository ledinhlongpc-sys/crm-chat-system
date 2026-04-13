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

    const {
      branch_id,
      customer_id,
      created_by,
      sale_date,
      expected_delivery_at,
      order_source,
      note,
	  order_discount_amount,
      items,
	  costs,
      payments,
	  address_snapshot,
    } = body;

    if (!branch_id || !created_by || !order_source) {
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

    const header = {
      branch_id,
      customer_id,
      created_by,
      order_source,
      note: (note ?? "").trim() || null,
      sale_date: sale_date
        ? new Date(sale_date).toISOString()
        : new Date().toISOString(),
      expected_delivery_at: expected_delivery_at
        ? new Date(expected_delivery_at).toISOString()
        : null,
	   order_discount_amount: order_discount_amount ?? 0,
	   address_snapshot: address_snapshot ?? null,
    };

    /* =========================
       CALL RPC
    ========================== */

    const { data: order_id, error } = await supabase.rpc(
      "sales_order_create_draft",
      {
        p_tenant_id: tenant_id,
        p_header: header,
        p_items: items,
		p_costs: costs ?? [], 
        p_payments: payments ?? [],
      }
    );

    if (error || !order_id) {
      return NextResponse.json(
        { error: error?.message || "CREATE_DRAFT_FAILED" },
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