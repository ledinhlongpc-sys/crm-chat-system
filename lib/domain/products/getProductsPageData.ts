import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

export async function getProductsPageData({
  page,
  limit,
  q,
  categoryIds,
  brandIds,
  tagIds,
}: {
  page: number;
  limit: number;
  q: string;
  categoryIds: string[];
  brandIds: string[];
  tagIds: string[];
}) {
  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  if (!tenant_id) throw new Error("Tenant not found");

  /* ================= CALL RPC ================= */

  const { data, error } = await supabase.rpc(
    "get_products_page_full",
    {
      p_tenant_id: tenant_id,
      p_page: page,
      p_limit: limit,
      p_q: q?.trim() || null,

      // 👇 tách riêng
      p_category_ids: categoryIds?.length ? categoryIds : null,
      p_tag_ids: tagIds?.length ? tagIds : null,

      p_brand_ids: brandIds?.length ? brandIds : null,
    }
  );

  if (error) throw new Error(error.message);

  const products = data?.data ?? [];
  const total = data?.total ?? 0;

  /* ================= LOAD FILTER DATA ================= */

  const [
    { data: categories },
    { data: brands },
  ] = await Promise.all([
    supabase
      .from("system_product_categories")
      .select("id, name, parent_id, sort_order")
      .eq("tenant_id", tenant_id)
      .eq("is_active", true)
      .order("sort_order"),

    supabase
      .from("system_product_brands")
      .select("id, name")
      .eq("tenant_id", tenant_id)
      .order("name"),
  ]);

  return {
    products,
    total,
    categories: categories ?? [],
    brands: brands ?? [],
  };
}