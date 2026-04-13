// app/(protected)/(paid)/customers/page.tsx



import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantCounts } from "@/lib/getTenantCounts";
import PageHeader from "@/components/app/header/PageHeader";
import CustomersHeaderActions from "./CustomersHeaderActions";
import CustomersClient from "./CustomersClient";
import { pageUI } from "@/ui-tokens";

/* ================= CONFIG ================= */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
};

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function CustomersPage({
  searchParams,
}: PageProps) {
  /* ================= PARAMS ================= */
  const params: SearchParams =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams ?? {};

  const page = Math.max(Number(params.page) || DEFAULT_PAGE, 1);

  const limit = ALLOWED_LIMITS.includes(Number(params.limit))
    ? Number(params.limit)
    : DEFAULT_LIMIT;

  const q = params.q ? params.q.replace(/\+/g, " ").trim() : "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= SUPABASE ================= */
  const supabase = await createSupabaseServerComponentClient();

  /* ================= COUNTS ================= */
  const counts = await getTenantCounts(supabase);
  const customerCount = counts.customer_count;

  /* ================= QUERY CUSTOMER GROUPS ================= */
  const { data: groups, error: groupsError } = await supabase
    .from("system_customer_groups")
    .select(`
      id,
      group_name
    `)
    .order("group_name", { ascending: true });

  if (groupsError) {
    throw new Error(groupsError.message);
  }

  /* ================= QUERY CUSTOMERS ================= */
  let customersQuery = supabase
    .from("system_customers")
    .select(
      `
      id,
      customer_code,
      name,
      phone,
	  status,      
      created_at,

      system_customer_groups (
        id,
        group_name
      )
    `
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");
    customersQuery = customersQuery.or(
      `name.ilike.%${keyword}%,phone.ilike.%${keyword}%`
    );
  }

  const { data: customers, error } = await customersQuery;

  if (error) {
    throw new Error(error.message);
  }

  const items = customers ?? [];

  /* ================= RENDER ================= */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Khách hàng"
          description="Quản lý danh sách khách hàng"
          right={<CustomersHeaderActions />}
        />

        <CustomersClient
          customers={items}
          groups={groups ?? []}  
          page={page}
          limit={limit}
          total={customerCount}
          q={q}
        />
      </div>
    </div>
  );
}
