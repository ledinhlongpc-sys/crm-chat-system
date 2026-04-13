import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import EmptyState from "@/components/app/empty-state/EmptyState";
import { pageUI } from "@/ui-tokens";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

import AccountDetailClient from "./AccountDetailClient";
import AccountHeaderActions from "./AccountHeaderActions";

/* ================= TYPES ================= */


export default async function AccountDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    page?: string;
    limit?: string;
  }>;
}) {
	
  /* ================= PARAM ================= */
  const { id } = await params;

const sp = searchParams
  ? await searchParams
  : {};

const page = Math.max(Number(sp.page) || 1, 1);
const limit = Number(sp.limit) || 10;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= SUPABASE ================= */
  const supabase =
    await createSupabaseServerComponentClient();

  /* ================= LOAD ACCOUNT ================= */
  const { data: account, error } = await supabase
    .from("system_financial_accounts")
    .select(`
      id,
      account_name,
      account_type,
      bank_name,
      account_number,
      account_holder,
      current_balance,
      opening_balance,
      is_default,
      is_active,
      branch_id,
      created_at
    `)
    .eq("id", id)
    .single();

  if (error || !account) {
    return (
      <div className={pageUI.wrapper}>
        <div className={pageUI.contentWide}>
          <EmptyState
            title="Không tìm thấy tài khoản"
            description="Có thể đã bị xoá hoặc không tồn tại"
          />
        </div>
      </div>
    );
  }

  /* ================= LOAD BRANCH ================= */
  const { data: branch } = await supabase
    .from("system_branches")
    .select("id, name")
    .eq("id", account.branch_id)
    .single();

  /* ================= LOAD ALL BRANCHES ================= */
  const { data: branches } = await supabase
    .from("system_branches")
    .select("id, name, branch_code, is_default")
    .order("created_at", { ascending: true });

  /* ================= LOAD CATEGORIES (FIX CHÍNH) ================= */
  const { data: categories } = await supabase
    .from("system_money_transaction_categories")
    .select(`
      id,
      category_name,
      category_type
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  /* ================= LOAD TRANSACTIONS ================= */
  const {
    data: transactions,
    count,
  } = await supabase
    .from("system_money_transactions")
    .select(
      `
      id,
      amount,
      direction,
      transaction_date,
      description,
      balance_after,
	  reference_type,
	  category:system_money_transaction_categories (
      id,
      category_name,
      category_type
    )
    `,
      { count: "exact" }
    )
    .eq("account_id", id)
    .order("transaction_date", { ascending: false })
    .range(from, to);

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title={account.account_name || "Chi tiết tài khoản"}
          left={<BackButton href="/finance/accounts" />}
          right={
            <AccountHeaderActions
              id={id}
              account={account}
              branches={branches || []}
              categories={categories || []} // 👈 QUAN TRỌNG
            />
          }
        />

        <AccountDetailClient
          account={account}
          branch={branch}
          transactions={transactions || []}
          page={page}
          limit={limit}
          total={count || 0}
		  categories={categories || []}   
		  branches={branches || []}  
        />
      </div>
    </div>
  );
}