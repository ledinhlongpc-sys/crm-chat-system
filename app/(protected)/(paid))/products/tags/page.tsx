// app/(protected)/(paid)/products/tags/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantCounts } from "@/lib/getTenantCounts";
import PageHeader from "@/components/app/header/PageHeader";
import TagHeaderActions from "./TagHeaderActions";
import TagClient from "./TagClient";
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

export default async function TagsPage({ searchParams }: PageProps) {
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

  /* ================= COUNTS ================= */
  const counts = await getTenantCounts(supabase);
  const tagCount = counts.tag_count;

  /* ================= QUERY TAGS ================= */
  let tagsQuery = supabase
    .from("system_product_tags")
    .select(`
      id,
      name,
      created_at
    `)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    const keyword = q.replace(/[%_]/g, "\\$&");
    tagsQuery = tagsQuery.ilike("name", `%${keyword}%`);
  }

  const { data: tags, error } = await tagsQuery;

  if (error) throw new Error(error.message);

  const items = tags ?? [];

  /* ================= RENDER ================= */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Thẻ sản phẩm"
          description="Quản lý thẻ (tag) dùng cho sản phẩm"
          right={<TagHeaderActions />}
        />

        <TagClient
          tags={items}
          page={page}
          limit={limit}
          total={tagCount}
          q={q}
        />
      </div>
    </div>
  );
}
