import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import EmptyState from "@/components/app/empty-state/EmptyState";

import { pageUI } from "@/ui-tokens";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

import ShareholderDetailClient from "./ShareholderDetailClient";
import ShareholderHeaderActions from "./ShareholderHeaderActions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ShareholderDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase =
    await createSupabaseServerComponentClient();

  /* ================= SHAREHOLDER ================= */

  const {
    data: shareholder,
    error,
  } = await supabase
    .from("system_company_shareholders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !shareholder) {
    return (
      <div className={pageUI.wrapper}>
        <div className={pageUI.contentWide}>
          <EmptyState
            title="Không tìm thấy cổ đông"
            description="Có thể đã bị xoá hoặc không tồn tại"
          />
        </div>
      </div>
    );
  }

  /* ================= BRANCH (DETAIL) ================= */

  let branch = null;

  if (shareholder.branch_id) {
    const { data } = await supabase
      .from("system_branches")
      .select("id, name, branch_code")
      .eq("id", shareholder.branch_id)
      .maybeSingle();

    branch = data;
  }

  /* ================= LOAD ALL BRANCHES ================= */

  const { data: branches } = await supabase
    .from("system_branches")
    .select(`
      id,
      name,
      branch_code,
      is_default,
      is_active
    `)
    .eq("is_active", true)
    .order("is_default", { ascending: false });

 /* ================= CAPITAL ================= */

const { data: capital } = await supabase
  .from("system_capital_transactions")
  .select(`
    id,
    amount,
    transaction_type,
    transaction_date,
    note,

    account:account_id (
      id,
      account_name
    )
  `)
  .eq("shareholder_id", id)
  .order("transaction_date", { ascending: false });

/* ================= LOAD MONEY TX ================= */

const capitalIds = (capital || []).map((c) => c.id);

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

/* ================= MERGE ================= */

const capitalWithTx = (capital || []).map((item) => ({
  ...item,

  // 🔥 FIX CHÍNH (unwrap account)
  account: Array.isArray(item.account)
    ? item.account[0]
    : item.account || null,

  money_tx: moneyMap.get(item.id) || null,
}));



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
  
  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title={
            shareholder.shareholder_name ||
            "Chi tiết cổ đông"
          }
          left={
            <BackButton href="/finance/shareholders" />
          }
          right={
            <ShareholderHeaderActions
              id={id}
              branches={branches ?? []} // ✅ KEY FIX
			  shareholder={shareholder} 
			  accounts={accounts ?? []}
            />
          }
        />

        <ShareholderDetailClient
          shareholder={{
            ...shareholder,
            branch,
          }}
          capitalData={capitalWithTx || []}
        />
      </div>
    </div>
  );
}