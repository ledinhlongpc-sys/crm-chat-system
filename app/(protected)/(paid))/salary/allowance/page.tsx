import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";

import AllowanceTypeHeaderActions from "./AllowanceTypeHeaderActions";
import AllowanceTypeClient from "./AllowanceTypeClient";

/* ================= CONFIG ================= */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
};

type Props = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function Page({ searchParams }: Props) {
  const params =
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

  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  let query = supabase
    .from("system_salary_item_types")
    .select("id, name, is_active", { count: "exact" })
    .eq("tenant_id", tenant_id)
    .eq("type", "allowance");

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Danh mục phụ cấp"
          left={<BackButton href="/salary" />}
          right={<AllowanceTypeHeaderActions />}
        />

        <AllowanceTypeClient
          data={data || []}
          page={page}
          limit={limit}
          total={count || 0}
          q={q}
        />
      </div>
    </div>
  );
}
