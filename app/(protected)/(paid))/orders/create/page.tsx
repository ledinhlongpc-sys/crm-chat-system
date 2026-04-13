import CreateSalesClient from "./CreateSalesClient";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import { pageUI } from "@/ui-tokens";

export default async function CreateSalesPage() {
  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  /* ================= LOAD DATA SONG SONG ================= */

  const [
    branchesRes,
    usersRes,
    customersRes,
    orderSourcesRes,
    provincesV1Res,
    provincesV2Res,
    customerGroupsRes,
  ] = await Promise.all([
    /* ===== BRANCHES ===== */
    supabase
      .from("system_branches")
      .select("id, name, is_default")
      .eq("tenant_id", tenant_id)
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .order("created_at"),

    /* ===== STAFF ===== */
    supabase
      .from("system_user")
      .select("system_user_id, full_name")
      .eq("tenant_id", tenant_id)
      .eq("user_status", "active")
      .order("full_name"),

    /* ===== CUSTOMERS ===== */
    supabase
      .from("system_customers")
      .select(`
        id,
        name,
        phone,
        email,
        current_debt,
        total_sale,
        total_return,
        total_sale_count,
        total_return_count
      `)
      .eq("tenant_id", tenant_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50),

    /* ===== ORDER SOURCES ===== */
    supabase
  .from("system_order_sources")
  .select(`
    id,
    source_code,
    source_name,
    is_active,
    sort_order
  `)
  .eq("is_active", true)
  .order("sort_order"),

    /* ===== ADDRESS PROVINCES V1 ===== */
    supabase
      .from("system_address_provinces_v1")
      .select("code, name")
      .order("name"),

    /* ===== ADDRESS PROVINCES V2 ===== */
    supabase
      .from("system_address_provinces_v2")
      .select("code, name")
      .order("name"),

    /* ===== CUSTOMER GROUPS ===== */
    supabase
      .from("system_customer_groups")
      .select("id, group_name, is_default")
      .eq("tenant_id", tenant_id)
      .order("is_default", { ascending: false })
      .order("group_name"),
  ]);

  /* ================= MAP DATA ================= */

  const branches =
    branchesRes.data?.map((b) => ({
      id: b.id,
      name: b.name,
      is_default: b.is_default,
    })) ?? [];

  const staffs =
    usersRes.data?.map((u) => ({
      id: u.system_user_id,
      full_name: u.full_name,
    })) ?? [];


  const orderSources =
    orderSourcesRes.data?.map((s) => ({
      id: s.id,
      source_code: s.source_code,
      source_name: s.source_name,
      is_active: s.is_active,
      sort_order: s.sort_order,
    })) ?? [];

  /* ===== ADDRESS MAP ===== */

  const addressV1 = {
    provinces:
      provincesV1Res.data?.map((p) => ({
        code: p.code,
        name: p.name,
      })) ?? [],
  };

  const addressV2 = {
    provinces:
      provincesV2Res.data?.map((p) => ({
        code: p.code,
        name: p.name,
      })) ?? [],
  };

  /* ===== CUSTOMER GROUPS MAP ===== */

  const customerGroups =
    customerGroupsRes.data?.map((g) => ({
      id: g.id,
      name: g.group_name, // 🔥 đúng cột trong DB
    })) ?? [];

  /* ================= CURRENT USER ================= */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUserId = user?.id ?? "";

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <CreateSalesClient
          branches={branches}
          staffs={staffs}
          currentUserId={currentUserId}
          orderSources={orderSources}
          customerGroups={customerGroups}
          addressV1={addressV1}
          addressV2={addressV2}
        />
      </div>
    </div>
  );
}