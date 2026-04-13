// app/(protected)/(paid)/finance/transactions/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import { pageUI } from "@/ui-tokens";
import BackButton from "@/components/app/button/BackButton";
import TransactionsHeaderActions from "./TransactionsHeaderActions";
import TransactionsClient from "./TransactionsClient";

/* ================= CONFIG ================= */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  date?: string;
  category?: string;
  direction?: string;
};

type Props = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function TransactionsPage({
  searchParams,
}: Props) {
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
  const date = params.date || "";
  const category = params.category || "";
  const direction = params.direction || "";
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= SUPABASE ================= */
  const supabase = await createSupabaseServerComponentClient();

  /* ================= QUERY ================= */
  let query = supabase
    .from("system_money_transactions")
    .select(
      `
      id,
      transaction_date,
      description,
      transaction_type,
      reference_type,
      direction,
      amount,
      balance_after,
      created_at,

      account:system_financial_accounts (
        id,
        account_name
      ),

      category:system_money_transaction_categories (
        id,
        category_name,
        category_type
      )
    `,
      { count: "exact" }
    );

  /* ================= SEARCH ================= */
  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");
    query = query.or(`description.ilike.%${keyword}%`);
  }

  /* ================= FILTER ================= */
  if (date) {
    query = query
      .gte("transaction_date", date + " 00:00:00")
      .lte("transaction_date", date + " 23:59:59");
  }

  if (category) {
    query = query.eq("category_id", category);
  }

  if (direction) {
    query = query.eq("direction", direction);
  }

  /* ================= ORDER + PAGINATION ================= */
  query = query
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  /* ================= EXECUTE ================= */
  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  /* ================= LOAD ACCOUNTS ================= */
  const { data: accounts } = await supabase
    .from("system_financial_accounts")
    .select(`
      id,
      account_name,
      account_type,
      is_default,
      is_active
    `)
    .eq("is_active", true)
    .order("is_default", { ascending: false });

  /* ================= LOAD CATEGORIES ================= */
  const { data: categories } = await supabase
    .from("system_money_transaction_categories")
    .select(`
      id,
      category_name,
      category_type
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

/* ================= NORMALIZE ================= */

const finalData = (data || []).map((item) => ({
  ...item,

  account: Array.isArray(item.account)
    ? item.account[0]
    : item.account || null,

  category: Array.isArray(item.category)
    ? item.category[0]
    : item.category || null,
}));

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
  title="Giao dịch tài chính"
  left={
     <BackButton href="/finance" />
  }
  right={
    <TransactionsHeaderActions
      accounts={accounts ?? []}
      categories={categories ?? []}
    />
  }
/>

        <TransactionsClient
          data={finalData}
          page={page}
          limit={limit}
          total={count ?? 0}
          q={q}
          accounts={accounts ?? []}
          categories={categories ?? []}
        />
      </div>
    </div>
  );
}