import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import { pageUI } from "@/ui-tokens";
import BackButton from "@/components/app/button/BackButton";

import PurchaseInvoicesClient from "./PurchaseInvoicesClient";
import PurchaseInvoicesHeaderActions from "./PurchaseInvoicesHeaderActions";

/* ================= CONFIG ================= */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  from?: string;      // 👈 đổi sang range
  to?: string;        // 👈 đổi sang range
  supplier?: string;
  branch?: string;
  type?: string;
vat?: string;
};

type Props = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function PurchaseInvoicesPage({
  searchParams,
}: Props) {
  const params: SearchParams =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams ?? {};

  const page = Math.max(Number(params.page) || DEFAULT_PAGE, 1);

  const limit = ALLOWED_LIMITS.includes(Number(params.limit))
    ? Number(params.limit)
    : DEFAULT_LIMIT;

  const q = params.q ? params.q.replace(/\+/g, " ").trim() : "";

  const fromDate = params.from || "";
  const toDate = params.to || "";

  const supplier = params.supplier || "";
  const branch = params.branch || "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

 const type = params.type || "";
const vat = params.vat || "";

  /* ================= SUPABASE ================= */
  const supabase = await createSupabaseServerComponentClient();

  /* ================= QUERY ================= */
  let query = supabase
    .from("system_purchase_invoices")
    .select(
      `
      id,
      invoice_number,
      invoice_date,
      subtotal_amount,
      vat_amount,
      total_amount,
      created_at,

      invoice_type,
      is_vat,
      branch_id,

      supplier:system_supplier (
  id,
  supplier_name
),
      branch:system_branches (
        id,
        name
      )
    `,
      { count: "exact" }
    );

 /* ================= SEARCH ================= */
if (q) {
  const keyword = q.trim();

  const { data: matchedSuppliers } = await supabase
    .from("system_supplier")
    .select("id")
    .ilike("supplier_name", `%${keyword}%`);

  const supplierIds = matchedSuppliers?.map((s) => s.id) ?? [];

  if (supplierIds.length > 0) {
    query = query.or(
      `invoice_number.ilike.%${keyword}%,supplier_id.in.(${supplierIds.join(",")})`
    );
  } else {
    query = query.ilike("invoice_number", `%${keyword}%`);
  }
}

  /* ================= FILTER ================= */

  // 🔥 DATE RANGE
  if (fromDate && toDate) {
    query = query
      .gte("invoice_date", fromDate)
      .lte("invoice_date", toDate);
  }

  // 🔥 SUPPLIER
  if (supplier) {
    query = query.eq("supplier_id", supplier);
  }

  // 🔥 BRANCH
  if (branch) {
    query = query.eq("branch_id", branch);
  }
  
  // TYPE
if (type) {
  query = query.eq("invoice_type", type);
}

// VAT
if (vat === "yes") {
  query = query.eq("is_vat", true);
}
if (vat === "no") {
  query = query.eq("is_vat", false);
}

  /* ================= ORDER ================= */
  query = query
    .order("invoice_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  /* ================= EXECUTE ================= */
  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  /* ================= LOAD SUPPLIERS ================= */
  const { data: suppliers } = await supabase
    .from("system_supplier")
    .select("id, supplier_name")
    .eq("status", "active")
    .order("supplier_name");

  /* ================= LOAD BRANCHES ================= */
  const { data: branches } = await supabase
    .from("system_branches")
    .select("id, name, is_default")
    .eq("is_active", true)
    .order("is_default", { ascending: false });
	
	const finalData = (data || []).map((item) => ({
  ...item,

  supplier: Array.isArray(item.supplier)
    ? item.supplier[0]
    : item.supplier || null,

  branch: Array.isArray(item.branch)
    ? item.branch[0]
    : item.branch || null,
}));

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Quản Lý Hóa Đơn Đầu Vào"
          left={<BackButton href="/finance" />}
          right={
            <PurchaseInvoicesHeaderActions
              suppliers={suppliers ?? []}
              branches={branches ?? []}
            />
          }
        />

        <PurchaseInvoicesClient
          data={finalData}
          page={page}
          limit={limit}
          total={count ?? 0}
          q={q}
          suppliers={suppliers ?? []}
          branches={branches ?? []}
        />
      </div>
    </div>
  );
}