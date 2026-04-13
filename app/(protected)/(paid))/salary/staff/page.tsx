import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";

import SalaryStaffHeaderActions from "./SalaryStaffHeaderActions";
import SalaryStaffClient from "./SalaryStaffClient";

/* ================= CONFIG ================= */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  status?: string;
  position?: string; // ✅ fix
  branch?: string;
};

type Props = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function SalaryStaffPage({
  searchParams,
}: Props) {
  /* ================= PARAMS ================= */
  const params: SearchParams =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams ?? {};

  const page = Math.max(Number(params.page) || DEFAULT_PAGE, 1);

  const limit = ALLOWED_LIMITS.includes(Number(params.limit))
    ? Number(params.limit)
    : DEFAULT_LIMIT;

  const q = params.q ? params.q.replace(/\+/g, " ").trim() : "";
  const status = params.status || "";
  const position = params.position || "";
  const branch = params.branch || "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= SUPABASE ================= */
  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

const {
  data: { user },
} = await supabase.auth.getUser();

let userType = "";

if (user) {
  const { data: userInfo } = await supabase
    .from("system_user")
    .select("user_type")
    .eq("system_user_id", user.id)
    .eq("tenant_id", tenant_id)
    .single();

  userType = userInfo?.user_type || "";
}
  /* ================= LOAD POSITIONS ================= */
  const { data: positions } = await supabase
    .from("system_salary_positions")
    .select("id, name, code")
    .eq("tenant_id", tenant_id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  /* ================= QUERY ================= */
  let query = supabase
    .from("system_salary_staffs")
    .select(
      `
      id,
      full_name,
      phone,
	  birth_date,
      status,
	  join_date,
	  created_at,
      branch_id,

      branch:system_branches (
        id,
        name
      ),

      position:system_salary_positions (
        id,
        name,
        code
      )
      `,
      { count: "exact" }
    )
    .eq("tenant_id", tenant_id);

  /* ================= SEARCH ================= */
  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");
    query = query.or(
      `full_name.ilike.%${keyword}%,phone.ilike.%${keyword}%`
    );
  }

  /* ================= FILTER ================= */
  if (status) {
    query = query.eq("status", status);
  }

  if (position) {
    query = query.eq("position_id", position);
  }

  if (branch) {
    query = query.eq("branch_id", branch);
  }

  /* ================= ORDER + PAGINATION ================= */
  query = query
    .order("created_at", { ascending: false })
    .range(from, to);

  /* ================= EXECUTE ================= */
  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  /* ================= NORMALIZE ================= */
  const finalData = (data || []).map((item) => ({
    ...item,
    branch: Array.isArray(item.branch)
      ? item.branch[0]
      : item.branch || null,
    position: Array.isArray(item.position)
      ? item.position[0]
      : item.position || null,
  }));

  /* ================= LOAD BRANCHES ================= */
  const { data: branches, error: branchesError } = await supabase
    .from("system_branches")
    .select("id, name, is_active, is_default")
    .eq("tenant_id", tenant_id)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (branchesError) throw new Error(branchesError.message);

  /* ================= RENDER ================= */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Danh Sách Nhân Viên"
          left={<BackButton href="/salary" />}
          right={
            <SalaryStaffHeaderActions
              branches={branches ?? []}
              positions={positions ?? []} // 🔥 fix crash
            />
          }
        />

        <SalaryStaffClient
          data={finalData}
          page={page}
          limit={limit}
          total={count ?? 0}
          q={q}
          status={status}
          position={position}
          branch={branch}
          branches={branches ?? []}
          positions={positions ?? []}
		  userType={userType}
        />
      </div>
    </div>
  );
}