import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

type Params = {
  page: number;
  limit: number;
  q?: string;
  status?: string | null;
  paymentStatus?: string | null;
};

export async function getPurchaseOrdersPageData({
  page,
  limit,
  q,
  status,
  paymentStatus,
}: Params) {
  const supabase = await createSupabaseServerComponentClient();

  /* ================= TENANT ================= */

  const tenant_id = await getTenantId(supabase);
  if (!tenant_id) throw new Error("Tenant not found");

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= BASE QUERY ================= */

  let query = supabase
    .from("system_purchase_orders")
    .select(
      `
        id,
        order_code,
        status,
        payment_status,
        total_amount,
        paid_amount,
        created_at,
        branch:system_branches!fk_po_branch(
          id,
          name
        ),
        supplier:system_supplier!fk_po_supplier(
          id,
          supplier_name
        ),
        creator:system_user!fk_po_created_by(
          system_user_id,
          full_name
        )
      `,
      { count: "planned" }
    )
    .eq("tenant_id", tenant_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  /* ================= SEARCH ================= */

  if (q?.trim()) {
    query = query.or(
      `
        order_code.ilike.%${q.trim()}%,
        system_supplier.supplier_name.ilike.%${q.trim()}%
      `
    );
  }

  /* ================= FILTER ================= */

  if (status) {
    query = query.eq("status", status);
  }

  if (paymentStatus) {
    query = query.eq("payment_status", paymentStatus);
  }

const { data, error, count } = await query;

if (error) {
  console.error("getPurchaseOrdersPageData error:", error);
  throw error;
}

/* ================= NORMALIZE ================= */

const normalizedOrders = (data ?? []).map((o: any) => ({
  ...o,
  branch: o.branch?.[0] ?? null,
  supplier: o.supplier?.[0] ?? null,
  creator: o.creator?.[0] ?? null,
}));

return {
  orders: normalizedOrders,
  total: count ?? 0,
};
}