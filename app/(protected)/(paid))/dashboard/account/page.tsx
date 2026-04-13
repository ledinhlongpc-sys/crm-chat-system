
// app/(protected)/(paid)/dashboard/account/page.tsx

import PageHeader from "@/components/app/header/PageHeader";
import { pageUI } from "@/ui-tokens";
import AccountPageClient from "./AccountPage.client";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

export default async function AccountPage() {

  const supabase = await createSupabaseServerComponentClient();

  /* ================= LOAD AUTH USER ================= */
  const {
    data: { user: authUser },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !authUser) {
    throw new Error("Không xác định được tài khoản đăng nhập");
  }

  /* ================= LOAD system_user ================= */
  const { data: systemUser, error: userErr } = await supabase
    .from("system_user")
    .select(`
      system_user_id,
      full_name,
      phone,
      service_status,
      service_start,
      service_end,
      user_avata_url,
      user_type,
      tenant_id
    `)
    .single();

  if (userErr || !systemUser) {
    throw new Error("Không tải được thông tin tài khoản");
  }

  /* ================= LOAD DEFAULT BRANCH ================= */
  let branch = null;

  if (systemUser.tenant_id) {
    const { data, error: branchErr } = await supabase
      .from("system_branches")
      .select(`
        id,
        name,
        phone,
        address,
        province_text,
        district_text,
        ward_text,
        branch_id,
        shop_logo_url
      `)
      .eq("tenant_id", systemUser.tenant_id)
      .eq("is_default", true)
      .eq("is_active", true)
      .maybeSingle();

    if (branchErr) {
      throw new Error("Không tải được chi nhánh mặc định");
    }

    branch = data ?? null;
  }

  /* ================= RENDER ================= */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Tài khoản của tôi"
          description="Quản lý thông tin cá nhân, cửa hàng và bảo mật tài khoản"
        />

        <AccountPageClient
          initialData={{
            user: systemUser,
            branch,
            auth_email: authUser.email ?? "",
          }}
        />
      </div>
    </div>
  );
}

