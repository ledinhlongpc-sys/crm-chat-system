import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

/* ================= TYPES ================= */

export type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
};

/* ======================================================
   GET CATEGORIES (TENANT-SAFE)
====================================================== */

export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerComponentClient();

  const tenant_id = await getTenantId(supabase);

  const { data, error } = await supabase
    .from("system_product_categories")
    .select(`
      id,
      name,
      parent_id,
      sort_order,
      is_active
    `)
    .eq("tenant_id", tenant_id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}