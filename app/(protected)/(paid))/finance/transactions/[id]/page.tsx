import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import EmptyState from "@/components/app/empty-state/EmptyState";

import { pageUI } from "@/ui-tokens";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

import TransactionDetailClient from "./TransactionDetailClient";
import TransactionHeaderActions from "./TransactionHeaderActions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TransactionDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase =
    await createSupabaseServerComponentClient();

  /* ================= TRANSACTION ================= */

  const { data: transaction, error } = await supabase
    .from("system_money_transactions")
    .select(`
      id,
      transaction_date,
      description,
      transaction_type,
      direction,
      amount,
      balance_after,
      created_at,
      created_by,
	   reference_type,
	   proof_images, 
	   
	    account_id,      
  category_id, 

  created_by_user:system_user!fk_created_by_user(
      system_user_id,
      full_name
    ),
		
      account:system_financial_accounts (
        id,
        account_name
      ),

      category:system_money_transaction_categories (
        id,
        category_name,
        category_type
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !transaction) {
    return (
      <div className={pageUI.wrapper}>
        <div className={pageUI.contentWide}>
          <EmptyState
            title="Không tìm thấy giao dịch"
            description="Có thể đã bị xoá hoặc không tồn tại"
          />
        </div>
      </div>
    );
  }

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
    .order("created_at", { ascending: false });
	
	/* ================= NORMALIZE ================= */

const finalTransaction = {
  ...transaction,

  account: Array.isArray(transaction.account)
    ? transaction.account[0]
    : transaction.account || null,

  category: Array.isArray(transaction.category)
    ? transaction.category[0]
    : transaction.category || null,

  created_by_user: Array.isArray(
    transaction.created_by_user
  )
    ? transaction.created_by_user[0]
    : transaction.created_by_user || null,
};

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Chi tiết giao dịch"
          left={
            <BackButton href="/finance/transactions" />
          }
          right={
            <TransactionHeaderActions
              id={id}
               transaction={finalTransaction}
              accounts={accounts ?? []}
              categories={categories ?? []}
            />
          }
        />

        <TransactionDetailClient
           transaction={finalTransaction}
        />
      </div>
    </div>
  );
}