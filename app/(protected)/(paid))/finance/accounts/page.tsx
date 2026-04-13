// app/(protected)/(paid)/finance/accounts/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import BackButton from "@/components/app/button/BackButton";
import PageHeader from "@/components/app/header/PageHeader";
import { pageUI } from "@/ui-tokens";

import AccountsHeaderActions from "./AccountsHeaderActions";
import AccountsClient from "./AccountsClient";

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

export default async function AccountsPage({
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
  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  /* ================= LOAD BRANCHES ================= */
  const { data: branches } = await supabase
    .from("system_branches")
    .select(`
      id,
      name,
      is_default,
      is_active
    `)
    .eq("tenant_id", tenant_id)
    .eq("is_active", true)
    .order("is_default", { ascending: false });

  /* ================= QUERY ACCOUNTS ================= */
  let query = supabase
    .from("system_financial_accounts")
    .select(
      `
      id,
      account_name,
      account_type,
      bank_name,
      account_number,
      current_balance,
      is_default,
      is_active,
      branch_id,
      created_at
    `,
      { count: "exact" }
    )
    .eq("tenant_id", tenant_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");
    query = query.or(
      `account_name.ilike.%${keyword}%,bank_name.ilike.%${keyword}%,account_number.ilike.%${keyword}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
  title="Tài khoản tiền"
  left={
    <BackButton href="/finance" />
  }
  right={
    <AccountsHeaderActions
      branches={branches ?? []}
    />
  }
/>

        <AccountsClient
          data={data ?? []}
          page={page}
          limit={limit}
          total={count ?? 0}
          q={q}
          branches={branches ?? []}
        />
      </div>
    </div>
  );
}