import { pageUI } from "@/ui-tokens";
import PageHeader from "@/components/app/header/PageHeader";

import ShippersClient from "./ShippersClient";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

/* =====================================================
   PAGE
===================================================== */

export default async function ShippersPage() {

  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  /* ================= LOAD DATA ================= */

  const { data: shippers } = await supabase
    .from("system_carriers")
    .select(`
      id,
      code,
      name,
      is_active
    `)
    .eq("tenant_id", tenant_id)
    .order("name");

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>

      <div className={pageUI.contentWide}>

        <PageHeader
          title="Đối tác vận chuyển"
        />

        <ShippersClient
          shippers={shippers ?? []}
        />

      </div>

    </div>
  );
}