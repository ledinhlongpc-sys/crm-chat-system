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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const order_id = body?.order_id;

    if (!order_id) {
      return NextResponse.json(
        { error: "Thiếu order_id" },
        { status: 400 }
      );
    }

    /* =========================
       1) LOAD ORDER GỐC
    ========================== */

    const { data: order, error: orderError } = await supabase
      .from("system_sales_orders")
      .select(`
        id,
        tenant_id,
        branch_id,
        customer_id,
        order_source,
        discount_amount,
        address_snapshot
      `)
      .eq("tenant_id", tenant_id)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng cần sao chép" },
        { status: 404 }
      );
    }

    /* =========================
       2) LOAD ITEMS
    ========================== */

    const { data: items, error: itemsError } = await supabase
      .from("system_sales_order_items")
      .select(`
        id,
        variant_id,
        unit_id,
        factor_snapshot,
        base_quantity,
        sku_snapshot,
        name_snapshot,
        quantity,
        price,
        discount_value,
        discount_type,
        discount_amount,
        line_total
      `)
      .eq("tenant_id", tenant_id)
      .eq("order_id", order_id);

    if (itemsError) {
      return NextResponse.json(
        { error: "Không thể tải sản phẩm của đơn gốc" },
        { status: 500 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Đơn gốc không có sản phẩm để sao chép" },
        { status: 400 }
      );
    }

    /* =========================
       3) LOAD COSTS
    ========================== */

    const { data: costs, error: costsError } = await supabase
      .from("system_sales_order_costs")
      .select(`
        id,
        reason,
        amount
      `)
      .eq("tenant_id", tenant_id)
      .eq("sales_order_id", order_id);

    if (costsError) {
      return NextResponse.json(
        { error: "Không thể tải chi phí của đơn gốc" },
        { status: 500 }
      );
    }

    /* =========================
       4) BUILD PAYLOAD MỚI
       - created_by = user hiện tại
       - sale_date = now
       - expected_delivery_at = null
       - note = null
       - payments = []
    ========================== */

    const header = {
      branch_id: order.branch_id,
      customer_id: order.customer_id ?? null,
      created_by: user.id,
      order_source: order.order_source,
      note: null,
      sale_date: new Date().toISOString(),
      expected_delivery_at: null,
      order_discount_amount: order.discount_amount ?? 0,
      address_snapshot: order.address_snapshot ?? null,
    };

    const mappedItems = items.map((i) => ({
      variant_id: i.variant_id,
      unit_id: i.unit_id ?? null,
      factor_snapshot: i.factor_snapshot ?? 1,
      base_quantity: i.base_quantity ?? 0,
      sku_snapshot: i.sku_snapshot ?? null,
      name_snapshot: i.name_snapshot ?? null,
      quantity: i.quantity ?? 0,
      price: i.price ?? 0,
      discount_value: i.discount_value ?? 0,
      discount_type: i.discount_type ?? null,
      discount_amount: i.discount_amount ?? 0,
      line_total: i.line_total ?? 0,
    }));

    const mappedCosts =
      costs?.map((c) => ({
        reason: c.reason ?? "",
        amount: c.amount ?? 0,
      })) ?? [];

    /* =========================
       5) GỌI RPC TẠO DRAFT MỚI
    ========================== */

    const { data: new_order_id, error: createError } = await supabase.rpc(
      "sales_order_create_draft",
      {
        p_tenant_id: tenant_id,
        p_header: header,
        p_items: mappedItems,
        p_costs: mappedCosts,
        p_payments: [], // 🔥 KHÔNG sao chép thanh toán
      }
    );

    if (createError || !new_order_id) {
      return NextResponse.json(
        { error: createError?.message || "DUPLICATE_ORDER_FAILED" },
        { status: 500 }
      );
    }

    /* =========================
       6) LẤY ORDER CODE MỚI
    ========================== */

    const { data: newOrder, error: fetchNewError } = await supabase
      .from("system_sales_orders")
      .select("id, order_code")
      .eq("tenant_id", tenant_id)
      .eq("id", new_order_id)
      .single();

    if (fetchNewError || !newOrder) {
      return NextResponse.json(
        { error: "Không thể lấy mã đơn hàng mới" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order_id: newOrder.id,
      order_code: newOrder.order_code,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}