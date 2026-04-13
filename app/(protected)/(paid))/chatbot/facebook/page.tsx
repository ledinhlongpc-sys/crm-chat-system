"use server";

import { pageUI } from "@/ui-tokens";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

export default async function FacebookIntegrationPage() {
  /* ================= SUPABASE ================= */

  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  /* ================= ENV ================= */

  const APP_ID = process.env.FACEBOOK_APP_ID!;
  const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI!;

  if (!tenant_id) {
    return (
      <div className={pageUI.container}>
        <PageHeader title="Kết nối Facebook" left={<BackButton />} />
        <div className="text-red-500">Thiếu tenant_id</div>
      </div>
    );
  }

  /* ================= LOGIN URL ================= */

  const fbLoginUrl =
    "https://www.facebook.com/v24.0/dialog/oauth" +
    `?client_id=${APP_ID}` +
    `&redirect_uri=${REDIRECT_URI}` +
    `&state=${tenant_id}` +
    "&scope=pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging,business_management" +
    "&auth_type=rerequest";

  /* ================= UI ================= */

  return (
    <div className={pageUI.container}>
      <PageHeader title="Kết nối Facebook" left={<BackButton />} />

      <div className="bg-white border border-neutral-200 rounded-xl p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-4">
          Kết nối Fanpage
        </h2>

        <p className="text-sm text-neutral-600 mb-6">
          Kết nối Facebook để đồng bộ tin nhắn và bình luận về CRM
        </p>

        <a
          href={fbLoginUrl}
          className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          Kết nối Facebook
        </a>

        {/* DEBUG */}
        <div className="mt-4 text-xs text-neutral-400">
          tenant_id: {tenant_id}
        </div>
      </div>
    </div>
  );
}