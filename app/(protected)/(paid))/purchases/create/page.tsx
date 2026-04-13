import CreatePurchaseClient from "./CreatePurchaseClient";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import { pageUI } from "@/ui-tokens";

export default async function CreatePurchasePage() {
  const supabase =
    await createSupabaseServerComponentClient();

  const tenant_id = await getTenantId(supabase);

  /* ================= LOAD DATA SONG SONG ================= */

  const [branchesRes, usersRes, suppliersRes] =
    await Promise.all([
      supabase
        .from("system_branches")
        .select("id, name, is_default")
        .eq("tenant_id", tenant_id)
        .eq("is_active", true)
		.order("is_default", { ascending: false })
        .order("created_at"),

      supabase
        .from("system_user")
        .select("system_user_id, full_name")
        .eq("tenant_id", tenant_id)
        .eq("user_status", "active")
        .order("full_name"),

      /* ===== PRELOAD 50 NCC ===== */
      supabase
        .from("system_supplier")
        .select(`
          id,
          supplier_name,
          phone,
          address,
          current_debt,
          total_purchase,
          total_return,
          total_purchase_count,
          total_return_count
        `)
        .eq("tenant_id", tenant_id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50),
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

  const suppliers =
    suppliersRes.data?.map((s) => ({
      id: s.id,
      name: s.supplier_name,
      phone: s.phone,
      address: s.address,
      current_debt: s.current_debt,
      total_purchase: s.total_purchase,
      total_return: s.total_return,
      total_purchase_count: s.total_purchase_count,
      total_return_count: s.total_return_count,
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
        <CreatePurchaseClient
          suppliers={suppliers}
          branches={branches}
          staffs={staffs}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
