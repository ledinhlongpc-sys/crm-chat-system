import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { UserType } from "@/types/user";
import { canViewCost } from "@/lib/permissions";

/* ================= TYPES ================= */

export type PricePolicy = {
  id: string;
  ten_chinh_sach: string;
  ma_chinh_sach: string;
  loai_gia: string;
  sort_order: number | null;
};

type GetPricePoliciesParams = {
  tenantId: string;
  userType?: UserType;
};

/* ================= MAIN ================= */

export async function getPricePolicies({
  tenantId,
  userType,
}: GetPricePoliciesParams): Promise<PricePolicy[]> {
  const supabase = await createSupabaseServerComponentClient();

  let query = supabase
    .from("system_price_policies")
    .select(`
      id,
      ten_chinh_sach,
      ma_chinh_sach,
      loai_gia,
      sort_order
    `)
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  /* ===== PERMISSION ===== */

  const canViewCostPrice = canViewCost(userType);

  if (!canViewCostPrice) {
    query = query.neq("loai_gia", "gia_nhap");
  }

  /* ===== EXECUTE ===== */

  const { data, error } = await query.order("sort_order", {
    ascending: true,
  });

  if (error) {
    throw new Error(
      `Failed to load price policies: ${error.message}`
    );
  }

  return (
    data?.map((p: any) => ({
      id: p.id,
      ten_chinh_sach: p.ten_chinh_sach,
      ma_chinh_sach: p.ma_chinh_sach,
      loai_gia: p.loai_gia,
      sort_order: p.sort_order ?? null,
    })) ?? []
  );
}