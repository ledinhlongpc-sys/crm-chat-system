// app/(protected)/(paid)/products/brands/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantCounts } from "@/lib/getTenantCounts";
import PageHeader from "@/components/app/header/PageHeader";
import BrandHeaderActions from "./BrandHeaderActions";
import BrandClient from "./BrandClient";
import { pageUI } from "@/ui-tokens";

/* ================= CONFIG ================= */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
};

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function BrandsPage({
  searchParams,
}: PageProps) {
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

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= SUPABASE ================= */
  const supabase = await createSupabaseServerComponentClient();

  /* ================= COUNTS (CACHE) ================= */
  const counts = await getTenantCounts(supabase);
  const brandCount = counts.brand_count; // ✅ LUÔN DÙNG

  /* ================= QUERY ================= */
  let query = supabase
    .from("system_product_brands")
    .select(`
      id,
      name,
      created_at,
      product_count
    `)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");
    query = query.ilike("name", `%${keyword}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  /* ================= RENDER ================= */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Nhãn hiệu"
          description="Quản lý nhãn hiệu sản phẩm"
          right={<BrandHeaderActions />}
        />

        <BrandClient
          brands={data ?? []}
          page={page}
          limit={limit}
          total={brandCount}   // ✅ LUÔN TRUYỀN
          q={q}
        />
      </div>
    </div>
  );
}
