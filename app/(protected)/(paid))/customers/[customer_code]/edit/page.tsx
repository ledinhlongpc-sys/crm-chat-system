// app/(protected)/(paid)/customers/[customer_code]/edit/page.tsx

import { pageUI } from "@/ui-tokens";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getAddresses } from "@/lib/getAddresses";
import CustomersCreatePageClient from "./CustomersCreatePageClient";

type Props = {
  params: Promise<{ customer_code: string }>;
};

export default async function EditCustomerPage({ params }: Props) {
  /* ================= PARAM ================= */
  const { customer_code } = await params;

  const supabase = await createSupabaseServerComponentClient();

  /* ================= AUTH ================= */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const tenant_id = user.id;
  
  const { data: staffs, error: staffErr } = await supabase
  .from("system_user")
  .select("system_user_id, full_name")
  .eq("tenant_id", tenant_id)
  .in("user_type", ["tenant", "staff"])
  .order("full_name");

if (staffErr) {
  throw new Error(
    staffErr.message || "Không tải được nhân viên"
  );
}

/* ================= LOAD CUSTOMER GROUPS ================= */
const { data: customerGroups, error: groupErr } =
  await supabase
    .from("system_customer_groups")
    .select(`
      id,
      group_name
    `)
    .eq("tenant_id", tenant_id)
    .order("group_name");

if (groupErr) {
  throw new Error(
    groupErr.message || "Không tải được nhóm khách hàng"
  );
}

  /* ================= LOAD CUSTOMER + ADDRESSES (JOIN) ================= */
  const { data: customer, error: customerErr } = await supabase
    .from("system_customers")
    .select(`
      id,
      customer_code,
      name,
      phone,
      email,
      group_id,
      assigned_staff_id,
      note,
      status,

      system_customer_addresses (
        address_line,
        
        province_code_v1,
        district_code_v1,
        ward_code_v1,
        province_name_v1,
        district_name_v1,
        ward_name_v1,

        province_code_v2,
        commune_code_v2,
        province_name_v2,
        commune_name_v2
      )
    `)
    .eq("tenant_id", tenant_id)
    .eq("customer_code", customer_code)
    .single();

  if (customerErr || !customer) {
    throw new Error(
      customerErr?.message || "Không tìm thấy khách hàng"
    );
  }

  /* ================= PICK DEFAULT ADDRESS ================= */
  const addressList =
    customer.system_customer_addresses ?? [];

const address =
  addressList.length > 0 ? addressList[0] : null;

  /* ================= LOAD OPTIONS (FOR USER EDIT) =================
     ❗ CHỈ DÙNG ĐỂ CHỌN LẠI – KHÔNG MAP
  =============================================================== */
  const addresses = await getAddresses(supabase);

  /* ================= RENDER ================= */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <CustomersCreatePageClient
          initialData={customer}
          initialAddress={address}
          addressV1={addresses.v1}
          addressV2={addresses.v2}
          currentUserId={tenant_id}
		  staffs={
    staffs?.map((s) => ({
      id: s.system_user_id,
      name: s.full_name,
    })) ?? []
  }
		  customerGroups={
    customerGroups?.map((g) => ({
      id: g.id,
      name: g.group_name,
    })) ?? []
  }
        />
      </div>
    </div>
  );
}
