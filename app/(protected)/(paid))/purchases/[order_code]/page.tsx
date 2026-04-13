import PurchaseDetailClient from "./PurchaseDetailClient";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import { pageUI } from "@/ui-tokens";

type PageProps = {
  params: Promise<{ order_code: string }>;
};

export default async function PurchaseDetailPage({ params }: PageProps) {
  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  // ✅ Next dynamic params: phải await trước khi dùng
  const { order_code: raw } = await params;
  const order_code = decodeURIComponent(raw ?? "").trim();

  if (!order_code) {
    return (
      <div className={pageUI.wrapper}>
        <div className={pageUI.contentWide}>
          <div className="text-sm text-neutral-600">Thiếu mã đơn nhập.</div>
        </div>
      </div>
    );
  }

  /* ===== LOAD SONG SONG ===== */
  const [branchesRes, usersRes, suppliersRes, detailRes, authRes] =
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

      supabase
        .from("system_supplier")
        .select(
          `
          id,
          supplier_name,
          phone,
          address,
          current_debt,
          total_purchase,
          total_return,
          total_purchase_count,
          total_return_count
        `
        )
        .eq("tenant_id", tenant_id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50),

      // ✅ RPC lấy full đơn
      supabase.rpc("purchase_order_get_full_by_code", {
        p_order_code: order_code,
      }),

      supabase.auth.getUser(),
    ]);

  // ✅ log để bắt lỗi “trắng UI”
  if (detailRes.error) {
    console.log("purchase_order_get_full_by_code ERROR:", detailRes.error);
  }

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

  const currentUserId = authRes.data?.user?.id ?? "";

  // ✅ data có thể null nếu RPC lỗi/RLS/không tìm thấy
  const initialData = (detailRes.data ?? null) as any;

  // ✅ fallback UI nếu RPC lỗi để anh thấy ngay (khỏi “trắng”)
  if (!initialData?.order) {
    return (
      <div className={pageUI.wrapper}>
        <div className={pageUI.contentWide}>
          <div className="text-sm text-neutral-600">
            Không tìm thấy đơn nhập <span className="font-medium">{order_code}</span>
          </div>

          {detailRes.error && (
            <div className="mt-2 text-xs text-red-600 whitespace-pre-wrap">
              RPC error: {detailRes.error.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PurchaseDetailClient
          orderCode={order_code}
          initialData={initialData}
          suppliers={suppliers}
          branches={branches}
          staffs={staffs}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}