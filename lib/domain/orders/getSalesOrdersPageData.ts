import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

/* =====================================================
   TYPES
===================================================== */

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

type Params = {
  page: number;
  limit: number;
  q?: string;
  orderStatus?: string | null;
  paymentStatus?: string | null;
  fulfillmentStatus?: string | null;
  invoiceStatus?: string | null;
  from?: string; 
  to?: string;  
};

/* =====================================================
   MAIN FUNCTION
===================================================== */

export async function getSalesOrdersPageData({
  page,
  limit,
  q,
  orderStatus,
  paymentStatus,
  fulfillmentStatus, 
  invoiceStatus,
   from,
  to,
}: Params) {

  const supabase = await createSupabaseServerComponentClient();

  /* ================= TENANT ================= */

  const tenant_id = await getTenantId(supabase);
  if (!tenant_id) throw new Error("Tenant not found");

 const fromRow = (page - 1) * limit;
const toRow = fromRow + limit - 1;
 const fromDate = from || "";
const toDate = to || "";

/* ================= LOAD ORDER SOURCES ================= */

const { data: sources } = await supabase
  .from("system_order_sources")
  .select("source_code, source_name");

const sourceMap = Object.fromEntries(
  sources?.map((s) => [s.source_code, s.source_name]) || []
);
  /* ================= BASE QUERY ================= */

  let query = supabase
    .from("system_sales_orders")
    .select(
      `
        id,
        order_code,
        order_status,
		order_source,
external_platform,
external_order_id,
        payment_status,
        fulfillment_status,
        einvoice_batch_id,
        subtotal_amount,
        discount_amount,
        total_amount,
        paid_amount,
        cancelled_at,
        created_at,
        sale_date,
		address_snapshot,

        invoice:system_einvoice_batches!einvoice_batch_id(
  invoice_number
),

        customer:system_customers!fk_sales_customer(
          id,
          name,
          phone
		 ),

        creator:system_user!fk_sales_created_by(
          system_user_id,
          full_name
        ),

        items:system_sales_order_items(
  id,
  quantity,
  price,
  discount_amount,
  line_total,

  sku_snapshot,
  name_snapshot,

  variant:system_product_variants!variant_id(
    sku,
    variant_name,
    image_url
  ),

  unit:system_product_unit_conversions!unit_id(
    unit_name,
    sku,
    image_url
  )
),

        payments:system_sales_order_payments(
          id,
          method,
          amount,
          paid_at
        ),
		costs:system_sales_order_costs(
  amount,
  reason
)
      `,
      { count: "exact" }
    )
    .eq("tenant_id", tenant_id)
    .order("order_code", { ascending: false })
    .range(fromRow, toRow);

  /* ================= SEARCH ================= */

if (q?.trim()) {
  const keyword = q.trim();

  /* ===== tìm customer (name + phone) ===== */
  const { data: matchedCustomers } = await supabase
    .from("system_customers")
    .select("id")
    .or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%`);

  const customerIds = matchedCustomers?.map(c => c.id) ?? [];

  if (customerIds.length > 0) {
    query = query.or(
      `order_code.ilike.%${keyword}%,customer_id.in.(${customerIds.join(",")})`
    );
  } else {
    query = query.ilike("order_code", `%${keyword}%`);
  }
}
  /* ================= FILTER ================= */

  if (orderStatus) {
    query = query.eq("order_status", orderStatus);
  }

  if (paymentStatus) {
    query = query.eq("payment_status", paymentStatus);
  }
  if (fulfillmentStatus) {
  query = query.eq("fulfillment_status", fulfillmentStatus);
  
}
if (invoiceStatus === "has_invoice") {
  query = query.not("einvoice_batch_id", "is", null);
}

if (invoiceStatus === "no_invoice") {
  query = query.is("einvoice_batch_id", null);
}


if (fromDate && toDate) {
  const fromUTC = new Date(fromDate + "T00:00:00").toISOString();
const toUTC = new Date(toDate + "T23:59:59").toISOString();

query = query
  .gte("sale_date", fromUTC)
  .lte("sale_date", toUTC);
}

  /* ================= EXECUTE ================= */

  const { data, error, count } = await query;

  if (error) {
    console.error("getSalesOrdersPageData error:", error);
    throw error;
  }

  /* ================= MAP DATA (QUAN TRỌNG) ================= */

  const orders =
    data?.map((order) => {

	const totalCost =
  order.costs?.reduce(
    (sum: number, c: any) => sum + (c.amount || 0),
    0
  ) ?? 0;
  
     const customer = one(order.customer);
const creator = one(order.creator);

const invoice = one(order.invoice);



      return {
        id: order.id,
        order_code: order.order_code,

        order_status: order.order_status,
        payment_status: order.payment_status,
        fulfillment_status: order.fulfillment_status,

        subtotal_amount: order.subtotal_amount,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
        paid_amount: order.paid_amount,

        sale_date: order.sale_date,
        created_at: order.created_at,
        cancelled_at: order.cancelled_at,
		 cost_total: totalCost,
		 costs: order.costs ?? [],
        invoice_number: invoice?.invoice_number ?? null,
		address_snapshot: order.address_snapshot,
		
		order_source: order.order_source,
order_source_name:
  sourceMap[order.order_source] || order.order_source,
  
external_platform: order.external_platform,
external_order_id: order.external_order_id,

        /* ===== CUSTOMER (FIX ARRAY BUG) ===== */
        customer: customer
          ? {
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
            }
          : null,

        /* ===== CREATOR ===== */
        creator: creator
          ? {
              id: creator.system_user_id,
              full_name: creator.full_name,
            }
          : null,

        /* ===== ITEMS ===== */
        items:
  order.items?.map((item: any) => {
    const variant = one(item.variant);
    const unit = one(item.unit);

    return {
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      discount_amount: item.discount_amount,
      line_total: item.line_total,

      sku: unit?.sku || variant?.sku || item.sku_snapshot,
      variant_name: item.name_snapshot,
      image: unit?.image_url || variant?.image_url,
    };
  }) ?? [],

        /* ===== PAYMENTS ===== */
        payments:
          order.payments?.map((p: any) => ({
            id: p.id,
            method: p.method,
            amount: p.amount,
            paid_at: p.paid_at,
          })) ?? [],
      };
    }) ?? [];


  /* ================= RETURN ================= */

  return {
    orders,
    total: count ?? 0,
  };
}