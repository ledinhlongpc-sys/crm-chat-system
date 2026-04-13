import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import EmptyState from "@/components/app/empty-state/EmptyState";

import { pageUI } from "@/ui-tokens";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

import CapitalDetailClient from "./CapitalDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const supabase = await createSupabaseServerComponentClient();

  const { data, error } = await supabase
    .from("system_capital_transactions")
    .select(`
      *,
      shareholder:system_company_shareholders(
        shareholder_name
      ),
      account:system_financial_accounts(
        account_name
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return <EmptyState title="Không tìm thấy" />;
  }

  return (
    <div className={pageUI.wrapper}>
      <PageHeader
        title="Chi tiết giao dịch"
        left={<BackButton href="/finance/capital" />}
      />

      <CapitalDetailClient data={data} />
    </div>
  );
}