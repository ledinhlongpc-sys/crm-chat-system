import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";
import SalaryHeaderActions from "./SalaryHeaderActions";
import SalaryClient from "./SalaryClient";


/* ================= TYPES ================= */

type SearchParams = {
  branch_id?: string;
  staff_id?: string;
  month?: string;
  year?: string;
};

type Props = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function Page({ searchParams }: Props) {
  const params =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams ?? {};

  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  const branch_id = params.branch_id || "";
  const staff_id = params.staff_id || "";
  const month = params.month || "";
  const year = params.year || "";

  /* ================= MONTH LOGIC ================= */

  const now = new Date();

const defaultDate = new Date(now.getFullYear(), now.getMonth() - 1);

const selectedMonth = Number(month || defaultDate.getMonth() + 1);
const selectedYear = Number(year || defaultDate.getFullYear());

  /* ================= LOAD FILTER DATA ================= */

  const { data: branches } = await supabase
    .from("system_branches")
    .select("id, name")
    .eq("tenant_id", tenant_id);

  const { data: staffs } = await supabase
    .from("system_salary_staffs")
    .select("id, full_name")
    .eq("tenant_id", tenant_id)
    .eq("status", "active");

  /* ================= QUERY PAYROLL (CHỈ 1 THÁNG) ================= */

  let query = supabase
    .from("system_salary_payrolls")
    .select("*")
    .eq("tenant_id", tenant_id)
    .eq("month", selectedMonth)
    .eq("year", selectedYear);

  if (branch_id) query = query.eq("branch_id", branch_id);
  if (staff_id) query = query.eq("staff_id", staff_id);

  const { data: payrolls } = await query;

  /* ================= KPI ================= */

  const totalSalary =
    payrolls?.reduce(
      (sum, i) =>
        sum +
        Number(i.final_salary || 0) +
        Number(i.advance_total || 0),
      0
    ) || 0;

  const totalAllowance =
    payrolls?.reduce(
      (sum, i) => sum + Number(i.allowance_total || 0),
      0
    ) || 0;

  const totalPenalty =
    payrolls?.reduce(
      (sum, i) => sum + Number(i.penalty_total || 0),
      0
    ) || 0;

  const totalAdvance =
    payrolls?.reduce(
      (sum, i) => sum + Number(i.advance_total || 0),
      0
    ) || 0;

  const netSalary =
    payrolls?.reduce(
      (sum, i) => sum + Number(i.final_salary || 0),
      0
    ) || 0;

  const attendanceBonus =
    payrolls?.reduce(
      (sum, i) => sum + Number(i.attendance_bonus || 0),
      0
    ) || 0;

  const seniorityBonus =
    payrolls?.reduce(
      (sum, i) => sum + Number(i.seniority_bonus || 0),
      0
    ) || 0;

  /* ================= STAFF COUNT ================= */

  const staffCount = staffs?.length || 0;

  /* ================= CHART (7 THÁNG) ================= */

  const { data: chartRaw } = await supabase.rpc(
    "get_salary_chart_7_months",
    { tenant_input: tenant_id }
  );

  const chartData =
    chartRaw?.map((i: any) => ({
      month: `${i.month}/${i.year}`,
      total: Number(i.total || 0),
    })) || [];

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Tổng Quan Nhân Sự"
          left={<BackButton href="/" />}
          right={<SalaryHeaderActions />}
        />

          <SalaryClient
          totalSalary={totalSalary}
          totalAllowance={totalAllowance}
          totalPenalty={totalPenalty}
          totalAdvance={totalAdvance}
          netSalary={netSalary}
          attendanceBonus={attendanceBonus}
          seniorityBonus={seniorityBonus}
          staffCount={staffCount}
          chartData={chartData}
          month={selectedMonth}
          year={selectedYear}
        />
      </div>
    </div>
  );
}