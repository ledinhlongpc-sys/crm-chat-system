import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import { pageUI } from "@/ui-tokens";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";

export default async function FacebookIntegrationPage() {
  const supabase = await createSupabaseServerComponentClient();

  const tenant_id = await getTenantId(supabase);

  if (!tenant_id) {
    throw new Error("TENANT_NOT_FOUND");
  }

  const APP_ID = process.env.FACEBOOK_APP_ID!;
  const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI!;

  const fbLoginUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=pages_show_list,pages_messaging,pages_manage_metadata&state=${tenant_id}`;
 /* const fbLoginUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=pages_show_list,pages_messaging,pages_read_engagement,pages_manage_metadata,pages_manage_engagement`*/

  return (
    <div className={pageUI.container}>
      <PageHeader
        title="Kết nối Facebook"
        left={<BackButton />}
      />

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
      </div>
    </div>
  );
}