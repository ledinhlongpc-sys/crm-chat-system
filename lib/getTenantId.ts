// lib/getTenantId.ts
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Lấy tenant_id (shop id) của user đang login
 *
 * Quy ước:
 * - tenant (chủ shop): tenant_id = system_user_id của chính mình
 * - staff: tenant_id = system_user_id của chủ shop
 *
 * KHÔNG check quyền
 * KHÔNG phân biệt role
 * Chỉ xác định context SHOP
 */
export async function getTenantId(
  supabase: SupabaseClient
): Promise<string> {
  /* ================= AUTH ================= */
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (!user || authErr) {
    throw new Error("UNAUTHORIZED");
  }

  /* ================= LOAD TENANT ================= */
  const { data: systemUser, error: suErr } =
    await supabase
      .from("system_user")
      .select("tenant_id")
      .eq("system_user_id", user.id)
      .single();

  if (suErr || !systemUser?.tenant_id) {
    throw new Error("TENANT_NOT_FOUND");
  }

  return systemUser.tenant_id;
}
