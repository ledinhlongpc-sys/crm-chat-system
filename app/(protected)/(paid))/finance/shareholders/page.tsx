// app/(protected)/(paid)/finance/shareholders/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";
import ShareholdersHeaderActions from "./ShareholdersHeaderActions";
import ShareholdersClient from "./ShareholdersClient";

/* ================= CONFIG ================= */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
};

type Props = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function ShareholdersPage({
  searchParams,
}: Props) {
  /* ================= PARAMS ================= */
  const params: SearchParams =
    searchParams instanceof Promise
      ? await searchParams
      : (searchParams ?? {});

  const page = Math.max(Number(params.page) || DEFAULT_PAGE, 1);

  const limit = ALLOWED_LIMITS.includes(Number(params.limit))
    ? Number(params.limit)
    : DEFAULT_LIMIT;

  const q = params.q ? params.q.replace(/\+/g, " ").trim() : "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= SUPABASE ================= */
  const supabase = await createSupabaseServerComponentClient();

  /* ================= QUERY ================= */
  let query = supabase
    .from("system_company_shareholders")
    .select(`
  id,
  shareholder_name,
  phone,
  email,
  capital_commitment,
  capital_contributed,
  ownership_percent,
  status,
  created_at,
  branch_id,
  branch:system_branches (
    id,
    name,
    branch_code
  )
`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

/* ================= LOAD BRANCHES ================= */
const { data: branches } = await supabase
  .from("system_branches")
  .select(`
    id,
    name,
    branch_code,
    is_default,
    is_active
  `)
  .eq("is_active", true)
  .order("is_default", { ascending: false });
  
  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");
    query = query.or(
      `shareholder_name.ilike.%${keyword}%,phone.ilike.%${keyword}%,email.ilike.%${keyword}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
  title="Cổ đông / Thành viên"
  left={
    <BackButton href="/finance" />
	  }
  right={<ShareholdersHeaderActions branches={branches ?? []} />}
/>

        <ShareholdersClient
          data={data ?? []}
          page={page}
          limit={limit}
          total={count ?? 0}
          q={q}
		   branches={branches ?? []}
        />
      </div>
    </div>
  );
}