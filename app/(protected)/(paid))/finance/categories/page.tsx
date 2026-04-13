import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";

import CategoriesHeaderActions from "./CategoriesHeaderActions";
import CategoriesClient from "./CategoriesClient";

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

export default async function CategoriesPage({
  searchParams,
}: Props) {
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
  const supabase =
    await createSupabaseServerComponentClient();

  /* ================= QUERY ================= */
  let query = supabase
    .from("system_money_transaction_categories")
    .select(
      `
      id,
      category_name,
      category_type,
      is_active,
      created_at,
	  note
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  /* ================= SEARCH ================= */
  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");

    query = query.ilike(
      "category_name",
      `%${keyword}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Danh mục giao dịch"
          left={<BackButton href="/finance" />}
          right={<CategoriesHeaderActions />}
        />

        <CategoriesClient
          data={data ?? []}
          page={page}
          limit={limit}
          total={count ?? 0}
          q={q}
        />
      </div>
    </div>
  );
}