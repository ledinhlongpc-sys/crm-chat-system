import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import EmptyState from "@/components/app/empty-state/EmptyState";

import { pageUI } from "@/ui-tokens";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

import SalaryStaffDetailClient from "./SalaryStaffDetailClient";
import SalaryStaffHeaderActions from "./SalaryStaffHeaderActions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SalaryStaffDetailPage({
  params,
}: Props) {
  /* ================= PARAM ================= */
  const { id: staff_id } = await params;

  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  /* ================= USER ================= */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentUser } = await supabase
    .from("system_user")
    .select("system_user_id, user_type")
    .eq("system_user_id", user?.id)
    .maybeSingle();

  const userType = currentUser?.user_type || "staff";

  /* ================= BRANCHES ================= */

  const { data: branches } = await supabase
    .from("system_branches")
    .select("id, name")
    .eq("tenant_id", tenant_id)
    .eq("is_active", true)
    .order("is_default", { ascending: false });

  /* ================= POSITIONS ================= */

  const { data: positions } = await supabase
    .from("system_salary_positions")
    .select("id, name")
    .eq("tenant_id", tenant_id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  /* ================= SALARY CONFIG ================= */

  const { data: salaryConfig } = await supabase
    .from("system_salary_configs")
    .select("*")
    .eq("staff_id", staff_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: seniorityConfig } = await supabase
  .from("system_salary_seniority_configs")
  .select("*")
  .eq("tenant_id", tenant_id)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();
  
const { data: itemTypes } = await supabase
  .from("system_salary_item_types")
  .select("id, name, type")
  .eq("tenant_id", tenant_id)
  .eq("is_active", true);
  
  const { data: attendanceBonusConfig } = await supabase
  .from("system_salary_attendance_bonus_configs")
  .select("*")
  .eq("tenant_id", tenant_id)
  .limit(1)
  .maybeSingle();
  
  /* ================= SALARY _config_items ================= */
const { data: allowanceItemsRaw } = await supabase
  .from("system_salary_config_items")
  .select(`
    id,
    amount,
    item_type:system_salary_item_types (
      id,
      name,
      type
    )
  `)
  .eq("tenant_id", tenant_id)
  .eq("staff_id", staff_id)
  .eq("system_salary_item_types.is_active", true);
  
 const allowanceItems =
  allowanceItemsRaw?.map((i) => {
    const itemType = Array.isArray(i.item_type)
      ? i.item_type[0]
      : i.item_type;

    return {
      id: i.id,
      name: itemType?.name,
      type: itemType?.type,
      amount: i.amount,
    };
  }) || [];
  /* ================= STAFF ================= */

  const { data: staff, error } = await supabase
    .from("system_salary_staffs")
    .select(`
      id,
      full_name,
      phone,
      birth_date,
      join_date,
      id_number,
      address,
      status,
      created_at,
      branch_id,
      position_id,

      branch:system_branches (
        id,
        name
      ),

      position:system_salary_positions (
        id,
        name,
        code
      )
    `)
    .eq("id", staff_id) // ✅ dùng staff_id luôn
    .eq("tenant_id", tenant_id)
    .maybeSingle();

  if (error || !staff) {
    return (
      <div className={pageUI.wrapper}>
        <div className={pageUI.contentWide}>
          <EmptyState
            title="Không tìm thấy nhân viên"
            description="Có thể đã bị xoá hoặc không tồn tại"
          />
        </div>
      </div>
    );
  }

  /* ================= PAYROLLS ================= */

const { data: payrolls, error: payrollsError } = await supabase
  .from("system_salary_payrolls")
  .select(`
    id,
    month,
    year,

    total_hours,

    normal_salary,
    ot_salary,
    sunday_salary,
    holiday_salary,

    allowance_total,
    attendance_bonus,
    seniority_bonus,

    penalty_total,
    advance_total,

    final_salary,
    status,
    created_at
  `)
  .eq("tenant_id", tenant_id)
  .eq("staff_id", staff_id)
  .order("year", { ascending: false })
  .order("month", { ascending: false });

  if (payrollsError) {
    throw new Error(payrollsError.message);
  }

  /* ================= NORMALIZE ================= */

  const finalStaff = {
    ...staff,
    branch: Array.isArray(staff.branch)
      ? staff.branch[0]
      : staff.branch || null,
    position: Array.isArray(staff.position)
      ? staff.position[0]
      : staff.position || null,
  };

  /* ================= UI ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Chi tiết nhân viên"
          left={<BackButton href="/salary/staff" />}
          right={
            <SalaryStaffHeaderActions
              id={staff_id} // ✅ fix
              staff={finalStaff}
              userType={userType}
              branches={branches ?? []}
              positions={positions ?? []}
            />
          }
        />

        <SalaryStaffDetailClient
          staff={finalStaff}
          payrolls={payrolls ?? []}
          userType={userType}
          salaryConfig={salaryConfig}
		  allowanceItems={allowanceItems}
		  itemTypes={itemTypes}
		  seniorityConfig={seniorityConfig}
		  attendanceBonusConfig={attendanceBonusConfig}
        />
      </div>
    </div>
  );
}