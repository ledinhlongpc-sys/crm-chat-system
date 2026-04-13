import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

export type ProductTag = {
  id: string;
  name: string;
};

/* ======================================================
   GET PRODUCT TAGS
   - dùng cho ExtraInfoBox (TagsSelect)
   - load tất cả tag của tenant
====================================================== */

export async function getProductTags(): Promise<ProductTag[]> {
  /* ================= SUPABASE ================= */
  const supabase = await createSupabaseServerComponentClient();

  /* ================= TENANT ================= */
  const tenant_id = await getTenantId(supabase);

  /* ================= QUERY ================= */
  const { data, error } = await supabase
    .from("system_product_tags")
    .select("id, name")
    .eq("tenant_id", tenant_id)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    data?.map((t) => ({
      id: t.id,
      name: t.name,
    })) ?? []
  );
}
