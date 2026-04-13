import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";

import SalaryPenaltyHeaderActions from "./SalaryPenaltyHeaderActions";
import SalaryPenaltyClient from "./SalaryPenaltyClient";

/* ================= CONFIG ================= */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  staff?: string;
  from?: string;
  to?: string;
};

type Props = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function SalaryPenaltyPage({ searchParams }: Props) {
  const params: SearchParams =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams ?? {};

  const page = Math.max(Number(params.page) || DEFAULT_PAGE, 1);

  const limit = ALLOWED_LIMITS.includes(Number(params.limit))
    ? Number(params.limit)
    : DEFAULT_LIMIT;

  const q = params.q ? params.q.replace(/\+/g, " ").trim() : "";
  const staff = params.staff || "";
  const fromDate = params.from || "";
  const toDate = params.to || "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= SUPABASE ================= */
  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  /* ================= LOAD STAFF ================= */
  const { data: staffs } = await supabase
    .from("system_salary_staffs")
    .select("id, full_name")
    .eq("tenant_id", tenant_id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  /* ================= QUERY ================= */
  let query = supabase
    .from("system_salary_penalties")
    .select(
      `
      id,
      amount,
      reason,
      note,
      penalty_date,
      created_at,
      status,

      staff:system_salary_staffs (
        id,
        full_name
      )
    `,
      { count: "exact" }
    )
    .eq("tenant_id", tenant_id);

  /* ================= SEARCH ================= */
  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");
    query = query.or(
      `reason.ilike.%${keyword}%,note.ilike.%${keyword}%`
    );
  }

  /* ================= FILTER ================= */
  if (staff) {
    query = query.eq("staff_id", staff);
  }

  if (fromDate) {
    query = query.gte("penalty_date", fromDate);
  }

  if (toDate) {
    query = query.lte("penalty_date", toDate);
  }

  /* ================= ORDER + PAGINATION ================= */
  query = query
    .order("penalty_date", { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const finalData = (data || []).map((item) => {
  const staff = Array.isArray(item.staff)
    ? item.staff[0]
    : item.staff || null;

  return {
    ...item,
    staff,
    staff_id: staff?.id || "", // 🔥 QUAN TRỌNG
  };
});

  /* ================= RENDER ================= */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Phạt lương"
          left={<BackButton href="/salary" />}
          right={
            <SalaryPenaltyHeaderActions staffs={staffs ?? []} />
          }
        />

        <SalaryPenaltyClient
          data={finalData}
          page={page}
          limit={limit}
          total={count ?? 0}
          q={q}
          staff={staff}
          from={fromDate}
          to={toDate}
          staffs={staffs ?? []}
        />
      </div>
    </div>
  );
}