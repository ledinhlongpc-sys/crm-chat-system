// app/(protected)/(paid)/customers/create/page.tsx


import { pageUI } from "@/ui-tokens";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getAddresses } from "@/lib/getAddresses";

import CustomersCreatePageClient from "./CustomersCreatePageClient";

export default async function CreateCustomerPage() {
  const supabase = await createSupabaseServerComponentClient();

  /* ==================================================
     PRELOAD ADDRESS (PROVINCES ONLY)
  ================================================== */
  const addresses = await getAddresses(supabase);
  // addresses = { v1: { provinces }, v2: { provinces } }

  /* ==================================================
     PRELOAD STAFFS
  ================================================== */
  const { data: staffsRaw, error: staffErr } = await supabase
    .from("system_user")
    .select("system_user_id, full_name, user_type")
    .in("user_type", ["tenant", "staff"])
    .order("created_at", { ascending: true });
 const {
  data: { user },
} = await supabase.auth.getUser();

const currentUserId = user?.id ?? null;

  if (staffErr) {
    throw new Error(staffErr.message);
  }

  const staffs =
    (staffsRaw ?? []).map((u: any) => ({
      id: u.system_user_id,
      name: u.full_name || "Nhân viên",
    })) ?? [];

  /* ==================================================
     PRELOAD CUSTOMER GROUPS
  ================================================== */
  const { data: groupsRaw, error: groupErr } = await supabase
    .from("system_customer_groups")
    .select("id, group_name")
    .order("group_name", { ascending: true });

  if (groupErr) {
    throw new Error(groupErr.message);
  }

  const customerGroups =
    (groupsRaw ?? []).map((g: any) => ({
      id: g.id,
      name: g.group_name,
    })) ?? [];

  /* ==================================================
     RENDER
  ================================================== */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <CustomersCreatePageClient
          addressV1={addresses.v1}   // 👈 chỉ provinces
          addressV2={addresses.v2}   // 👈 chỉ provinces
          staffs={staffs}
          customerGroups={customerGroups} // 👈 NEW
		  currentUserId={currentUserId} 
        />
      </div>
    </div>
  );
}
