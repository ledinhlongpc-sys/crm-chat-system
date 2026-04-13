// app/(protected)/(paid)/suppliers/group/page.tsx
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import SupplierGroupHeaderActions from "./SupplierGroupHeaderActions";
import SupplierGroupsClient from "./SupplierGroupsClient";
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

export default async function SupplierGroupsPage({
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

  /* ================= QUERY GROUPS ================= */
  let groupsQuery = supabase
    .from("system_supplier_group")
    .select(
      `
        id,
        group_code,
        group_name,
        note,
        is_default,
        is_active,
        created_at,
        updated_at
      `,
      { count: "exact" }
    )
    .order("group_name")
    .range(from, to);

  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");
    groupsQuery = groupsQuery.or(
      `group_code.ilike.%${keyword}%,group_name.ilike.%${keyword}%`
    );
  }

  const { data: groups, count, error } = await groupsQuery;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const baseItems = groups ?? [];

  /* ================= MAP supplier_count (WORKAROUND) ================= */
  let items = baseItems.map((g) => ({
    ...g,
    supplier_count: 0,
  }));

  if (baseItems.length > 0) {
    const groupIds = baseItems.map((g) => g.id);

    const { data: suppliers, error: countErr } =
      await supabase
        .from("system_supplier")
        .select("supplier_group_id")
        .in("supplier_group_id", groupIds);

    if (countErr) throw new Error(countErr.message);

    const countMap: Record<string, number> = {};
    suppliers?.forEach((s) => {
      if (!s.supplier_group_id) return;
      countMap[s.supplier_group_id] =
        (countMap[s.supplier_group_id] || 0) + 1;
    });

    items = baseItems.map((g) => ({
      ...g,
      supplier_count: countMap[g.id] || 0,
    }));
  }

  /* ================= RENDER ================= */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Nhóm nhà cung cấp"
          description="Quản lý phân nhóm nhà cung cấp"
          right={<SupplierGroupHeaderActions />}
        />

        <SupplierGroupsClient
          groups={items}
          page={page}
          limit={limit}
          total={total}
          q={q}
        />
      </div>
    </div>
  );
}
