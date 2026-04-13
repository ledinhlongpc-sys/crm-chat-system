// app/(protected)/(paid)/customers/groups/[group_code]/page.tsx

// app/(protected)/(paid)/customers/groups/[group_code]/page.tsx

import { notFound } from "next/navigation";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import PrimaryLinkButton from "@/components/app/button/PrimaryLinkButton";
import EmptyState from "@/components/app/empty-state/EmptyState";
import { pageUI } from "@/ui-tokens";

import CustomersGroupDetailClient from "./CustomersGroupDetailClient";

/* ================= PAGE ================= */

type Props = {
  params: Promise<{
    group_code: string;
  }>;
};

export default async function CustomersGroupDetailPage({
  params,
}: Props) {
  // ✅ NEXT 15: params là Promise
  const { group_code } = await params;

  const supabase = await createSupabaseServerComponentClient();

  /* ================= LOAD GROUP ================= */
  const { data: group, error } = await supabase
    .from("system_customer_groups")
    .select(`
      id,
      group_code,
      group_name,
      note,
      is_default,
      customer_count
    `)
    .eq("group_code", group_code)
    .single();

  /* ===== GROUP NOT FOUND ===== */
  if (error || !group) {
    return (
      <div className={pageUI.wrapper}>
        <div className={pageUI.contentWide}>
          <EmptyState
  title="Không tìm thấy nhóm khách hàng"
  description="Nhóm khách hàng không tồn tại hoặc đã bị xoá"
  action={
    <PrimaryLinkButton href="/customers/groups">
      Quay lại danh sách nhóm
    </PrimaryLinkButton>
  }
/>
        </div>
      </div>
    );
  }

  /* ================= LOAD CUSTOMERS ================= */
  const { data: customers } = await supabase
    .from("system_customers")
    .select(`
      id,
      customer_code,
      name,
      phone,
      status,
      created_at
    `)
    .eq("group_id", group.id)
    .order("created_at", { ascending: false });

  /* ================= RENDER ================= */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        {/* ===== HEADER ===== */}
        <PageHeader
          title={`Nhóm: ${group.group_name}`}
          description={`Mã nhóm: ${group.group_code}`}
          left={
            <BackButton href="/customers/groups" />

              
          }
          right={
            <PrimaryLinkButton href="/customers">
              Danh sách khách hàng
            </PrimaryLinkButton>
          }
        />

        {/* ===== CLIENT ===== */}
        <CustomersGroupDetailClient
          group={group}
          customers={customers ?? []}
        />
      </div>
    </div>
  );
}
