import { SupabaseClient } from "@supabase/supabase-js";

export async function generateSupplierGroupCode(
  supabase: SupabaseClient,
  tenant_id: string
) {
  /* Lấy group_code lớn nhất theo tenant */
  const { data, error } = await supabase
    .from("system_supplier_group")
    .select("group_code")
    .eq("tenant_id", tenant_id)
    .order("group_code", { ascending: false }) // GRP-0009 > GRP-0002
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  let nextNumber = 1;

  if (data?.group_code) {
    // GRP-0004 → 4
    const match = data.group_code.match(/GRP-(\d+)$/);
    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  // GRP-0001
  const group_code = `GRP-${String(nextNumber).padStart(4, "0")}`;

  return group_code;
}
