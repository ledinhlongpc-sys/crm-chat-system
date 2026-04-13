import { SupabaseClient } from "@supabase/supabase-js";
import { UserType } from "@/types/user";

export async function getUserContext(supabase: SupabaseClient) {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (!user || authErr) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: systemUser, error } = await supabase
    .from("system_user")
    .select("tenant_id, user_type")
    .eq("system_user_id", user.id)
    .single();

  if (error || !systemUser) {
    throw new Error("USER_NOT_FOUND");
  }

  return {
    tenantId: systemUser.tenant_id as string,
    userType: systemUser.user_type as UserType,
  };
}