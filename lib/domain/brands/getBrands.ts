import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

/* ================= TYPES ================= */

export type Brand = {
  id: string;
  name: string;
};

/* ======================================================
   GET BRANDS (TENANT-SAFE)
====================================================== */

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createSupabaseServerComponentClient();

  /* ================= TENANT CONTEXT ================= */
  const tenant_id = await getTenantId(supabase);

  /* ================= QUERY ================= */
  const { data, error } = await supabase
    .from("system_product_brands")
    .select("id, name")
    .eq("tenant_id", tenant_id)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
