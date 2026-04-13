import EditSalesClient from "./EditSalesClient";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import { pageUI } from "@/ui-tokens";

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default async function EditSalesPage({
  params,
}: {
  params: Promise<{ order_code: string }>;
}) {
  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  const { order_code } = await params;

  /* =====================================================
     1️⃣ LOAD ORDER
  ===================================================== */

  const { data: order, error } = await supabase
    .from("system_sales_orders")
    .select(`
      id,
      order_code,
      branch_id,
      customer_id,
	  created_by,
      order_source,
      sale_date,
      expected_delivery_at,
      subtotal_amount,
      discount_amount,
      total_amount,
      paid_amount,
      payment_status,
      order_status,
      note,
      einvoice_batch_id,
	  address_snapshot,

      customer:system_customers!fk_sales_customer (
        id,
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
const orderId = order.id;
/* =========================
   MAP ADDRESS (GIỐNG API SEARCH)
========================= */

const mapAddresses = (list: any[]) =>
  (list ?? []).map((a: any) => ({
    id: a.id,
    address_line: a.address_line,
    province_name: a.province_name_v1 ?? null,
    district_name: a.district_name_v1 ?? null,
    ward_name: a.ward_name_v1 ?? null,
    receiver_name: a.receiver_name ?? null,
    receiver_phone: a.receiver_phone ?? null,
    is_default: a.is_default ?? false,
  }));

  /* =====================================================
     2️⃣ CUSTOMER
  ===================================================== */

 const customer = order.customer
  ? (() => {
      const addresses = mapAddresses(
        (order.customer as any).addresses ?? []
      );

      const default_address =
        addresses.find((a) => a.is_default) ?? null;

      return {
        ...(order.customer as any),
        addresses,
        default_address,

        selected_address: order.address_snapshot
          ? {
              id: "__snapshot__", // 🔥 cực quan trọng
              address_line: order.address_snapshot,
              receiver_name: null,
              receiver_phone: null,
              province_name: null,
              district_name: null,
              ward_name: null,
              is_default: false,
            }
          : default_address,
      };
    })()
  : null;

  /* =====================================================
     3️⃣ LOAD ITEMS
  ===================================================== */

  const { data: itemsRes } = await supabase
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
        image_url
      )
    `)
    .eq("tenant_id", tenant_id)
    .eq("order_id", orderId);

  const items =
  itemsRes?.map((i: any) => ({
    key: i.id,
    id: i.id,

    product_id: i.product_id ?? null,
    variant_id: i.variant_id,
    unit_conversion_id: i.unit_id ?? null,

    // 🔥 FIX CHÍNH
    product_name: i.variant?.variant_name ?? "", // fallback
    variant_name: i.name_snapshot ?? "",
    sku: i.sku_snapshot ?? "",
    image:
      i.variant?.image_url ||
      i.unit_conversion?.image_url ||
      null,

    unit_name:
      i.unit_conversion?.unit_name ||
      i.variant?.unit ||
      "",

    factor: i.factor_snapshot ?? 1,

    quantity: i.quantity ?? 0,
    price: i.price ?? 0,

    discount_value: i.discount_value ?? 0,
    discount_type: i.discount_type ?? "amount",

    cost_price_snapshot: i.cost_price_snapshot ?? 0,
  })) ?? [];
  
  const { data: costsRes } = await supabase
  .from("system_sales_order_costs")
  .select("*")
  .eq("tenant_id", tenant_id)
  .eq("sales_order_id", orderId);
  
  const extraCosts =
  costsRes?.map((c: any) => ({
    id: c.id,
    label: c.reason,
    amount: c.amount,
  })) ?? [];

const { data: paymentsRes } = await supabase
  .from("system_sales_order_payments")
  .select("*")
  .eq("tenant_id", tenant_id)
  .eq("order_id", orderId);
  
  const payments =
  paymentsRes?.map((p: any) => ({
    method: p.method,
    amount: p.amount,
    note: p.note ?? null,
    paid_at: p.paid_at ?? null,
  })) ?? [];
  
  
  /* =====================================================
     4️⃣ LOAD MASTER DATA (GIỐNG CREATE)
  ===================================================== */

  const [
    branchesRes,
    usersRes,
    orderSourcesRes,
    provincesV1Res,
    provincesV2Res,
    customerGroupsRes,
  ] = await Promise.all([
    /* ===== BRANCHES ===== */
    supabase
      .from("system_branches")
      .select("id, name")
      .eq("tenant_id", tenant_id),

    /* ===== STAFF ===== */
    supabase
      .from("system_user")
      .select("system_user_id, full_name")
      .eq("tenant_id", tenant_id),

    /* ===== ORDER SOURCES ===== */
    supabase
      .from("system_order_sources")
      .select("id, source_code, source_name")
      .order("sort_order"),

    /* ===== ADDRESS V1 ===== */
    supabase
      .from("system_address_provinces_v1")
      .select("code, name")
      .order("name"),

    /* ===== ADDRESS V2 ===== */
    supabase
      .from("system_address_provinces_v2")
      .select("code, name")
      .order("name"),

    /* ===== CUSTOMER GROUPS ===== */
    supabase
      .from("system_customer_groups")
      .select("id, group_name")
      .eq("tenant_id", tenant_id)
      .order("group_name"),
  ]);

  /* =====================================================
     5️⃣ MAP DATA
  ===================================================== */

  const branches = branchesRes.data ?? [];

  const staffs =
    usersRes.data?.map((u) => ({
      id: u.system_user_id,
      full_name: u.full_name,
    })) ?? [];

  const orderSources = orderSourcesRes.data ?? [];

  const addressV1 = {
    provinces:
      provincesV1Res.data?.map((p) => ({
        code: p.code,
        name: p.name,
      })) ?? [],
  };

  const addressV2 = {
    provinces:
      provincesV2Res.data?.map((p) => ({
        code: p.code,
        name: p.name,
      })) ?? [],
  };

  const customerGroups =
    customerGroupsRes.data?.map((g) => ({
      id: g.id,
      name: g.group_name,
    })) ?? [];

  /* =====================================================
     6️⃣ CURRENT USER
  ===================================================== */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUserId = user?.id ?? "";

  /* =====================================================
     7️⃣ RENDER
  ===================================================== */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <EditSalesClient
          order={{
            ...order,
            customer,
         
          }}
          items={items}
          branches={branches}
          staffs={staffs}
          orderSources={orderSources}
          addressV1={addressV1}
          addressV2={addressV2}
          customerGroups={customerGroups}
          currentUserId={currentUserId}
		  extraCosts={extraCosts} 
		  payments={payments}
        />
      </div>
    </div>
  );
}