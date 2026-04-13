// page.tsx

import FacebookClient from "./FacebookClient";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

export default async function Page() {
  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  const { data, error } = await supabase
    .from("system_facebook_conversations")
    .select(`
      conversation_id,
      customer_name,
      customer_avatar,
      last_message_time,
      last_message_text,
      fanpage_id,
      connection:system_facebook_connections(
        tenant_id,
        page_name,
        page_avatar
      )
    `)
    .eq("connection.tenant_id", tenant_id) // ✅ FIX
    .order("last_message_time", {
      ascending: false,
      nullsFirst: false,
    })
    .range(0, 19);

  if (error) {
    console.error("LOAD CONVERSATIONS ERROR:", error);
  }

  return (
    <FacebookClient
      conversations={data || []}
      tenant_id={tenant_id}
    />
  );
}