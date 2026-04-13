// app/(protected)/(paid)/suppliers/page.tsx
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantCounts } from "@/lib/getTenantCounts";
import PageHeader from "@/components/app/header/PageHeader";
import SuppliersHeaderActions  from "./SuppliersHeaderActions";
import EmptyState from "@/components/app/empty-state/EmptyState";
import SuppliersClient from "./SuppliersClient";
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

export default async function SuppliersPage({
  searchParams,
}: PageProps) {
  /* ================= PARAMS ================= */
  const params: SearchParams =
    searchParams instanceof Promise
      ? await searchParams
      : (searchParams ?? {});

  const page = Math.max(Number(params.page) || DEFAULT_PAGE, 1);

  const limit = ALLOWED_LIMITS.includes(Number(params.limit))
    ? Number(params.limit)
    : DEFAULT_LIMIT;

  const q = params.q ? params.q.replace(/\+/g, " ").trim() : "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= SUPABASE ================= */
  const supabase = await createSupabaseServerComponentClient();

  /* ================= COUNTS (PRECOMPUTED) ================= */
  const counts = await getTenantCounts(supabase);
  const supplierCount = counts.supplier_count;

  /* ================= QUERY SUPPLIERS ================= */
  let suppliersQuery = supabase
    .from("system_supplier")
    .select(`
      id,
      supplier_code,
      supplier_name,
      phone,
      email,
      current_debt,
      status,
      supplier_group:system_supplier_group (
        id,
        group_name
      )
    `)
    .order("supplier_code", { ascending: false })
    .range(from, to);

  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");
    suppliersQuery = suppliersQuery.or(
      `supplier_code.ilike.%${keyword}%,supplier_name.ilike.%${keyword}%,phone.ilike.%${keyword}%,email.ilike.%${keyword}%`
    );
  }

  const [
    { data: suppliers, error: suppliersErr },
    { data: groups, error: groupsErr },
  ] = await Promise.all([
    suppliersQuery,

    supabase
      .from("system_supplier_group")
      .select("id, group_name")
      .eq("is_active", true)
      .order("group_name"),
  ]);

  if (suppliersErr) throw new Error(suppliersErr.message);
  if (groupsErr) throw new Error(groupsErr.message);

  const items = (suppliers ?? []).map((s: any) => ({
  ...s,
  supplier_group: s.supplier_group?.[0] ?? null,
}));

  /* ================= EMPTY STATES ================= */

 

  /* ================= RENDER ================= */
return (
  <div className={pageUI.wrapper}>
    <div className={pageUI.contentWide}>
      <PageHeader
        title="Nhà cung cấp"
        description="Quản lý danh sách nhà cung cấp và công nợ"
        right={<SuppliersHeaderActions/>}
      />

      <SuppliersClient
        suppliers={items}
        groups={groups ?? []}
        page={page}
        limit={limit}
        total={supplierCount}
        q={q}
      />
    </div>
  </div>
);

}
