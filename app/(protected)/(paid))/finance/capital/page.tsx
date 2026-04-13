// app/(protected)/(paid)/finance/capital/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";

import CapitalClient from "./CapitalClient";
import CapitalHeaderActions from "./CapitalHeaderActions";

/* ================= CONFIG ================= */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
};

type Props = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function CapitalPage({ searchParams }: Props) {
  /* ================= PARAMS ================= */

  const params =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams ?? {};

  const page = Math.max(Number(params.page) || DEFAULT_PAGE, 1);
  const limit = Number(params.limit) || DEFAULT_LIMIT;
  const q = params.q?.trim() || "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= SUPABASE ================= */

  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  /* ================= LOAD ACCOUNTS ================= */

  const { data: accounts } = await supabase
    .from("system_financial_accounts")
    .select(`
      id,
      account_name,
      is_default,
      is_active
    `)
    .eq("tenant_id", tenant_id)
    .eq("is_active", true)
    .order("is_default", { ascending: false });

  /* ================= LOAD SHAREHOLDERS ================= */

  const { data: shareholders } = await supabase
    .from("system_company_shareholders")
    .select(`
      id,
      shareholder_name
    `)
    .eq("tenant_id", tenant_id)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  /* ================= CAPITAL QUERY ================= */

  let query = supabase
    .from("system_capital_transactions")
    .select(
      `
      id,
      amount,
      transaction_date,
      note,
      transaction_type,
      created_at,

      account:account_id (
        id,
        account_name
      ),

      shareholder:shareholder_id (
        id,
        shareholder_name
      ),

      created_by_user:created_by (
        system_user_id,
        full_name
      )
    `,
      { count: "exact" }
    )
    .eq("tenant_id", tenant_id)
    .order("transaction_date", { ascending: false })
    .range(from, to);

  /* ================= SEARCH ================= */

  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");

    query = query.or(`
      note.ilike.%${keyword}%
    `);
  }

  const { data: capitalData, count, error } = await query;

  if (error) {
    console.error("CAPITAL PAGE ERROR:", error);
    throw new Error(error.message);
  }

  /* ================= LOAD MONEY TX ================= */

  const capitalIds = (capitalData || []).map((c) => c.id);

  let moneyMap = new Map();

  if (capitalIds.length > 0) {
    const { data: moneyTx } = await supabase
      .from("system_money_transactions")
      .select("id, reference_id")
      .eq("reference_type", "capital")
      .in("reference_id", capitalIds);

    moneyMap = new Map(
      (moneyTx || []).map((m) => [m.reference_id, m])
    );
  }

  /* ================= MERGE DATA ================= */

 const finalData = (capitalData || []).map((item) => ({
  ...item,

  account: Array.isArray(item.account)
    ? item.account[0]
    : item.account || null,

  shareholder: Array.isArray(item.shareholder)
    ? item.shareholder[0]
    : item.shareholder || null,

  created_by_user: Array.isArray(item.created_by_user)
    ? item.created_by_user[0]
    : item.created_by_user || null,

  money_tx: moneyMap.get(item.id) || null,
}));

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Giao dịch góp vốn"
          left={<BackButton href="/finance" />}
          right={
            <CapitalHeaderActions
              accounts={accounts ?? []}
              shareholders={shareholders ?? []}
            />
          }
        />

        <CapitalClient
          data={finalData}
          page={page}
          limit={limit}
          total={count ?? 0}
          q={q}
        />
      </div>
    </div>
  );
}