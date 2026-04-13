import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import { pageUI } from "@/ui-tokens";
import BackButton from "@/components/app/button/BackButton";

import OrderInvoicesClient from "./OrderInvoicesClient";
import OrderInvoicesHeaderActions from "./OrderInvoicesHeaderActions";

/* ================= CONFIG ================= */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  from?: string;
  to?: string;
  customer?: string;
  branch?: string;
  type?: string;
  vat?: string;
};

type Props = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function OrderInvoicesPage({
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

  const branch = params.branch || "";

  const type = params.type || "";
  const vat = params.vat || "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= SUPABASE ================= */
  const supabase = await createSupabaseServerComponentClient();

  /* ================= QUERY ================= */
  let query = supabase
    .from("system_einvoice_batches")
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
      customer_id,

      customer:system_customers (
        id,
        name
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

  // tìm khách hàng theo tên
  const { data: matchedCustomers } = await supabase
    .from("system_customers")
    .select("id")
    .ilike("name", `%${keyword}%`);

  const customerIds =
    matchedCustomers?.map((c) => c.id) ?? [];

  if (customerIds.length > 0) {
    query = query.or(
      `invoice_number.ilike.%${keyword}%,customer_id.in.(${customerIds.join(",")})`
    );
  } else {
    query = query.ilike("invoice_number", `%${keyword}%`);
  }
}
  /* ================= FILTER ================= */

  // DATE RANGE
  if (fromDate && toDate) {
    query = query
      .gte("invoice_date", fromDate)
      .lte("invoice_date", toDate);
  }


  // BRANCH
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

  /* ================= LOAD CUSTOMERS ================= */
  const { data: customers } = await supabase
    .from("system_customers")
    .select("id, name")
    .eq("status", "active")
    .order("name");

  /* ================= LOAD BRANCHES ================= */
  const { data: branches } = await supabase
    .from("system_branches")
    .select("id, name, is_default")
    .eq("is_active", true)
    .order("is_default", { ascending: false });

  /* ================= RENDER ================= */
  const finalData = (data || []).map((item) => ({
  ...item,

  customer: Array.isArray(item.customer)
    ? item.customer[0]
    : item.customer || null,

  branch: Array.isArray(item.branch)
    ? item.branch[0]
    : item.branch || null,
}));

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Quản Lý Hóa Đơn Bán Hàng"
          left={<BackButton href="/finance" />}
          right={
            <OrderInvoicesHeaderActions
              customers={customers ?? []}
              branches={branches ?? []}
            />
          }
        />

        <OrderInvoicesClient
           data={finalData} 
          page={page}
          limit={limit}
          total={count ?? 0}
          q={q}
          customers={customers ?? []}
          branches={branches ?? []}
        />
      </div>
    </div>
  );
}