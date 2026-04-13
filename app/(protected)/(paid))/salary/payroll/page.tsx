import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";

import PayrollHeaderActions from "./PayrollHeaderActions";
import PayrollClient from "./PayrollClient";

/* ================= PARAM ================= */

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  month?: string;
  year?: string;
  staff?: string;
  branch?: string;
  status?: string;
};

type Payroll = {
  id: string;
  month: number;
  year: number;

  total_hours: number;

  normal_salary: number;
  ot_salary: number;
  sunday_salary: number;
  holiday_salary: number;

  allowance_total: number;
  attendance_bonus: number;
  seniority_bonus: number;

  penalty_total: number;
  advance_total: number;

  final_salary: number;
  status: string;

  staff?: {
    id: string;
    full_name: string;
    phone?: string;
    branch_id?: string;
    status: string;
  };
};

export default async function PayrollPage({ searchParams }: any) {
  const params = await Promise.resolve(searchParams);

  const page = Number(params.page || 1);
  const limit = Number(params.limit || 20);

  const q = params.q || "";
  const month = params.month || "";
  const year = params.year || "";
  const staff = params.staff || "";
  const branch = params.branch || "";
  const status = params.status || "";
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  /* ================= LOAD STAFFS ================= */

  const { data: staffs } = await supabase
    .from("system_salary_staffs")
    .select("id, full_name, phone, branch_id")
    .eq("tenant_id", tenant_id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  /* ================= LOAD BRANCHES ================= */

  const { data: branches } = await supabase
    .from("system_branches")
    .select("id, name")
    .eq("tenant_id", tenant_id)
    .eq("is_active", true)
    .order("is_default", { ascending: false });


  /* ================= QUERY PAYROLL ================= */

  let query = supabase
    .from("system_salary_payrolls")
    .select(
      `
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

      staff:system_salary_staffs (
        id,
        full_name,
        phone,
        branch_id,
		status 
      )
    `,
      { count: "exact" }
    )
    .eq("tenant_id", tenant_id);


  
  /* ================= FILTER ================= */

  if (month) query = query.eq("month", month);
  if (year) query = query.eq("year", year);

  if (staff) {
    query = query.eq("staff_id", staff);
  }

  if (branch) {
    query = query.eq("staff.branch_id", branch);
  }
  if (status) {
  query = query.eq("status", status);
}

  /* ================= SEARCH ================= */

 if (q) {
  const keyword = q.trim();

  const { data: staffs } = await supabase
    .from("system_salary_staffs")
    .select("id")
    .or(`full_name.ilike.%${keyword}%,phone.ilike.%${keyword}%`);

  const ids = staffs?.map((s) => s.id) || [];

  query = query.in("staff_id", ids.length ? ids : [""]);
}


  /* ================= ORDER ================= */

  query = query
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .range(from, to);

  const { data, count, error } = await query;
  
  const normalizedData =
  data?.map((i) => ({
    ...i,
    staff: Array.isArray(i.staff) ? i.staff[0] : i.staff,
  })) || [];

  if (error) throw new Error(error.message);

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Bảng lương"
          left={<BackButton href="/salary" />}
          right={<PayrollHeaderActions />}
        />

        <PayrollClient
          data={normalizedData as Payroll[]}
          page={page}
          limit={limit}
          total={count || 0}
          q={q}
          month={month}
          year={year}
          staffs={staffs || []}
          branches={branches || []}
          staff={staff}
          branch={branch}
		  status={status}
        />
      </div>
    </div>
  );
}