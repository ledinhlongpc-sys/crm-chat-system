// app/(protected)/(paid)/customers/[customer_code]/page.tsx

import { pageUI } from "@/ui-tokens";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import CustomersViewPageClient from "./CustomersViewPageClient";

/* ================= TYPES ================= */

type Props = {
  params: Promise<{
    customer_code: string;
  }>;
};

/* ================= PAGE ================= */

export default async function ViewCustomerPage({
  params,
}: Props) {

  const { customer_code } = await params;

  const supabase =
    await createSupabaseServerComponentClient();

  /* ================= AUTH ================= */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const tenant_id = user.id;

  /* ================= FETCH CUSTOMER ================= */

  const { data, error } = await supabase
    .from("system_customers")
    .select(`
      id,
      customer_code,
      name,
      phone,
      email,
      note,
      status,

      group:system_customer_groups!system_customers_group_id_fkey (
        id,
        group_name
      ),

      assigned_staff:system_user!system_customers_assigned_staff_id_fkey (
        system_user_id,
        full_name
      ),

      system_customer_addresses (
        address_line,
        province_name_v1,
        district_name_v1,
        ward_name_v1,
        province_name_v2,
        commune_name_v2
      )
    `)
    .eq("tenant_id", tenant_id)
    .eq("customer_code", customer_code)
    .single();

  if (error || !data) {
    throw new Error(
      error?.message || "Không tìm thấy khách hàng"
    );
  }

  /* ================= NORMALIZE DATA ================= */

  const customer = {
    ...data,

    group: Array.isArray(data.group)
      ? data.group[0] ?? null
      : data.group,

    assigned_staff: Array.isArray(data.assigned_staff)
      ? data.assigned_staff[0] ?? null
      : data.assigned_staff,
  };

  const address =
    data.system_customer_addresses?.[0] ?? null;

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <CustomersViewPageClient
          customer={customer}
          address={address}
        />
      </div>
    </div>
  );
}