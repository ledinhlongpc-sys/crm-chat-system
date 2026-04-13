import SalesOrderViewClient from "./SalesOrderViewClient";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import { pageUI } from "@/ui-tokens";

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default async function ViewSalesPage({
  params,
}: {
  params: Promise<{ order_code: string }>;
}) {
  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  const { order_code } = await params;

  /* =====================================================
     1️⃣ LOAD ORDER + CUSTOMER + ADDRESS
  ===================================================== */

  const { data: order, error } = await supabase
    .from("system_sales_orders")
    .select(`
      id,
      order_code,
      branch_id,
      created_by,
      order_source,
      sale_date,
      expected_delivery_at,
      subtotal_amount,
      discount_amount,
	  created_at,
	  cancelled_at,
      total_amount,
      paid_amount,
	  payment_status,
	  order_status,
	  updated_at,
      note,
	  fulfillment_status,
		
	  einvoice_batch_id,

  einvoice:system_einvoice_batches!einvoice_batch_id (
    id,
    invoice_number,
    invoice_date,
    total_amount
  ),

	
      shipment:system_sales_order_shipments (
      delivery_method,
      printed_at,
      picking_at,
      packed_at,
      handover_at,
      delivered_at,
      returned_at
      ),
	
      customer:system_customers!fk_sales_customer (
        id,
        customer_code,
        name,
        phone,
        email,
        current_debt,
        total_sales_amount,
        total_return_amount,
        total_sales_count,
        total_return_count,

        addresses:system_customer_addresses (
          id,
          receiver_name,
          receiver_phone,
          address_line,
          province_name_v1,
          district_name_v1,
          ward_name_v1,
          province_name_v2,
          commune_name_v2,
          is_default
        )
      )
    `)
    .eq("tenant_id", tenant_id)
    .eq("order_code", order_code)
    .single();
  if (!order || error) {
    return (
      <div className="p-6 text-red-500">
        Không tìm thấy đơn hàng
      </div>
    );
  }

  /* =====================================================
     2️⃣ BUILD CUSTOMER + DEFAULT ADDRESS
  ===================================================== */

  const customer = order.customer
  ? {
      ...(order.customer as any),
      default_address:
        (order.customer as any).addresses?.find((a: any) => a.is_default) ||
        (order.customer as any).addresses?.[0] ||
        null,
    }
  : null;
	
  const shipment = order.shipment?.[0] ?? null;

  const orderId = order.id;

  /* =====================================================
     3️⃣ LOAD CHILD DATA
  ===================================================== */

  const [
  itemsRes,
  costsRes,
  paymentsRes,
  branchesRes,
  usersRes,
  orderSourcesRes,
] = await Promise.all([

  supabase
    .from("system_sales_order_items")
    .select(`
      *,
      variant:system_product_variants!variant_id(
        id,
        variant_name,
        sku,
        unit,
        image_url
      ),
      unit_conversion:system_product_unit_conversions!unit_id(
        id,
        convert_unit,
        unit_name,
        sku,
        image_url
      )
    `)
    .eq("tenant_id", tenant_id)
    .eq("order_id", orderId),

  supabase
    .from("system_sales_order_costs")
    .select("*")
    .eq("tenant_id", tenant_id)
    .eq("sales_order_id", orderId),

  supabase
  .from("system_sales_order_payments")
  .select(`
    id,
    method,
    amount,
    note,
    paid_at,
    created_by,
    user:system_user!created_by(
      full_name
    )
  `)
  .eq("tenant_id", tenant_id)
  .eq("order_id", orderId)
  .order("paid_at", { ascending: false }),

  supabase
    .from("system_branches")
    .select("id, name")
    .eq("tenant_id", tenant_id),

  supabase
    .from("system_user")
    .select("system_user_id, full_name")
    .eq("tenant_id", tenant_id),

  supabase
    .from("system_order_sources")
    .select("id, source_code, source_name")
    .order("sort_order"),
]);


  /* =====================================================
     4️⃣ MAP ITEMS
  ===================================================== */

const items =
  itemsRes.data?.map((i: any) => {
    const isUnit = !!i.unit_id;

    const variant = i.variant || null;
    const unitConv = i.unit_conversion || null;

    // ✅ NAME: chỉ lấy snapshot
    const displayName =
      (i.name_snapshot && String(i.name_snapshot).trim()) || "—";

    // ✅ SKU: ưu tiên snapshot (để đồng bộ)
    const displaySku =
      (i.sku_snapshot && String(i.sku_snapshot).trim()) || "";

    const image =
      (isUnit ? unitConv?.image_url : variant?.image_url) || null;

    const uom =
      (isUnit ? unitConv?.convert_unit : variant?.unit) ||
      (isUnit ? unitConv?.unit_name : null) ||
      "—";

    return {
      key: i.id,
	  product_id: i.product_id ?? null, 
      variant_id: i.variant_id,
	  unit_conversion_id: i.unit_id ?? null,
	  variant_name: variant?.variant_name ?? "",
	  unit_id: i.unit_id,

      product_name: displayName, // ✅ cột tên
      sku: displaySku,
      image,

      unit_name: uom,
      uom,
      factor: i.factor_snapshot ?? 1,

      quantity: i.quantity ?? 0,
      base_quantity: i.base_quantity ?? 0,

      price: i.price ?? 0,

      discount_value: i.discount_value ?? 0,
      discount_type: i.discount_type ?? null,
      discount_amount: i.discount_amount ?? 0,

      line_total: i.line_total ?? 0,

      cost_price_snapshot: i.cost_price_snapshot ?? 0,
      gross_profit_amount: i.gross_profit_amount ?? 0,
    };
  }) ?? [];

  /* =====================================================
     5️⃣ COSTS
  ===================================================== */

  const extraCosts =
    costsRes.data?.map((c: any) => ({
      id: c.id,
      label: c.reason,
      amount: c.amount,
    })) ?? [];

  /* =====================================================
     6️⃣ PAYMENTS
  ===================================================== */
  const staffs =
    usersRes.data?.map((u: any) => ({
      id: u.system_user_id,
      full_name: u.full_name,
    })) ?? [];
	
  const payments =
  paymentsRes.data?.map((p: any) => ({
    id: p.id,
    method: p.method,
    amount: Number(p.amount) || 0,
    note: p.note,
    paid_at: p.paid_at,
    created_by_name: p.user?.full_name ?? "-",
  })) ?? [];
  
  /* =====================================================
     7️⃣ BRANCH / STAFF / SOURCE
  ===================================================== */

  const branches =
    branchesRes.data?.map((b: any) => ({
      id: b.id,
      name: b.name,
    })) ?? [];



  const orderSources =
    orderSourcesRes.data?.map((s: any) => ({
      id: s.id,
      source_code: s.source_code,
      source_name: s.source_name,
    })) ?? [];

/* =====================================================
   8️⃣ CALC ITEM TOTAL
===================================================== */

const itemsTotal = items.reduce(
  (sum, i) => sum + (i.line_total || 0),
  0
);

const totalQty = items.reduce(
  (sum, i) => sum + (i.quantity || 0),
  0
);

  /* =====================================================
     8️⃣ SUMMARY
  ===================================================== */

  const paidAmount = payments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  const summary = {
  note: order.note ?? "",

  totals: {
    total_quantity: totalQty,
    total_amount: itemsTotal, // ✅ tổng item sau chiết khấu
  },
  orderDiscountAmount: order.discount_amount ?? 0,
    breakdown: {
  total_quantity: totalQty,

  items_subtotal_amount: order.subtotal_amount ?? 0,

  items_discount_amount: order.discount_amount ?? 0,

  items_total_amount: itemsTotal,

  subtotal: order.subtotal_amount ?? 0,

  discount: order.discount_amount ?? 0,

  total: order.total_amount ?? 0,
},

    extraCosts,
    payments,

    grandTotal: order.total_amount ?? 0,

    paidAmount,

    remaining: Math.max(
      0,
      (order.total_amount ?? 0) - paidAmount
    ),
  };

  /* =====================================================
     9️⃣ RENDER
  ===================================================== */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <SalesOrderViewClient
  order={{
    ...order,
    customer,
    einvoice: one(order.einvoice)
  }}
  shipment={shipment}
  items={items}
  summary={summary}
  branches={branches}
  staffs={staffs}
  orderSources={orderSources}
/>
      </div>
    </div>
  );
}