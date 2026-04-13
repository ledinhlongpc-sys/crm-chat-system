// app/(protected)/(paid)/customers/groups/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import { pageUI } from "@/ui-tokens";
import BackButton from "@/components/app/button/BackButton";
import PrimaryLinkButton from "@/components/app/button/PrimaryLinkButton";
import CustomersGroupClient from "./CustomersGroupClient";

/* ================= PAGE ================= */

export default async function CustomersGroupsPage() {
  /* ================= SUPABASE ================= */
  const supabase = await createSupabaseServerComponentClient();

  /* ================= QUERY GROUPS ================= */
  const { data: groups, error } = await supabase
    .from("system_customer_groups")
    .select(`
      id,
      group_code,
      group_name,
      note,
      is_default,
      customer_count
    `)
    .order("group_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  /* ================= RENDER ================= */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        {/* ===== HEADER (SERVER ONLY) ===== */}
        <PageHeader
          title="Nhóm khách hàng"
          description="Quản lý nhóm khách hàng"
		  left={
            <BackButton href="/customers" />
              
          }
          right={
            <PrimaryLinkButton href="/customers">
              Danh sách khách hàng
            </PrimaryLinkButton>
          }
        />

        {/* ===== CLIENT ===== */}
        <CustomersGroupClient
          groups={groups ?? []}
        />
      </div>
    </div>
  );
}
