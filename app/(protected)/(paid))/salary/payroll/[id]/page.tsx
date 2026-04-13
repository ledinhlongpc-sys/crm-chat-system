import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";
import PayrollDetailHeaderActions from "./PayrollDetailHeaderActions";
import PayrollDetailClient from "./PayrollDetailClient";

export default async function PayrollDetailPage({ params }: any) {
  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  // ✅ NEXT 15 FIX
  const { id } = await params;

  /* ================= LẤY PAYROLL ================= */

  const { data, error } = await supabase
    .from("system_salary_payrolls")
    .select(`
  *,
  staff:system_salary_staffs (
    full_name,
    phone,
    branch:system_branches (name),
    join_date
  ),

  approved_user:system_user!system_salary_payrolls_approved_by_fkey (full_name),
  paid_user:system_user!system_salary_payrolls_paid_by_fkey (full_name)
`)
    .eq("id", id)
    .eq("tenant_id", tenant_id)
    .single();

  if (error) throw new Error(error.message);

  /* ================= ATTENDANCE ================= */

  const month = data.month;
  const year = data.year;

  const fromDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const toDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const { data: attendance } = await supabase
    .from("system_salary_attendance")
    .select(`
      work_date,
      morning_check_in,
      morning_check_out,
      afternoon_check_in,
      afternoon_check_out,
      total_hours
    `)
    .eq("tenant_id", tenant_id)
    .eq("staff_id", data.staff_id)
    .gte("work_date", fromDate)
    .lte("work_date", toDate)
    .order("work_date", { ascending: true });

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Chi tiết bảng lương"
          left={<BackButton href="/salary/payroll" />}
          right={<PayrollDetailHeaderActions item={data} />}
        />

        <PayrollDetailClient
          item={data}
          attendance={attendance || []}
        />
      </div>
    </div>
  );
}