// app/(protected)/(paid)/dashboard/settings/price-policies/page.tsx
import PricePolicySettings from "./PricePolicySettings";
import PricePolicyTable from "./PricePolicyTable";
import PageHeader from "@/components/app/header/PageHeader";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

import { pageUI, cardUI } from "@/ui-tokens";

/* ================= TYPES ================= */
type PricePolicy = {
  id: string;
  name: string;
  code: string;
   type: "gia_ban" | "gia_nhap";
  sort_order: number;
  is_system: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

type PricePolicySettingsData = {
  default_sale_price_id: string | null;
  default_purchase_price_id: string | null;
};

/* ================= PAGE ================= */
export default async function PricePoliciesPage() {
  const supabase =
    await createSupabaseServerComponentClient();

  /* ===== QUERY – RLS TỰ LỌC THEO tenant_id ===== */
  const [policiesRes, settingsRes] = await Promise.all([
    supabase
      .from("system_price_policies")
      .select(
        "id, ten_chinh_sach, ma_chinh_sach, loai_gia, sort_order"
      )
      .eq("is_active", true)
      .order("sort_order"),

    supabase
      .from("system_price_policy_settings")
      .select(
        "default_sale_price_id, default_purchase_price_id"
      )
      .maybeSingle(),
  ]);

  if (policiesRes.error) {
    throw new Error("Không tải được chính sách giá");
  }

  const policies: PricePolicy[] =
    policiesRes.data?.map((p) => {
      const isSystem = p.sort_order <= 3;
      return {
        id: p.id,
        name: p.ten_chinh_sach,
        code: p.ma_chinh_sach,
        type: p.loai_gia as "gia_ban" | "gia_nhap",
        sort_order: p.sort_order,
        is_system: isSystem,
        can_edit: !isSystem,
        can_delete: !isSystem,
      };
    }) ?? [];

  const settings: PricePolicySettingsData =
    settingsRes.data ?? {
      default_sale_price_id: null,
      default_purchase_price_id: null,
    };

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Chính sách giá"
          description="Thiết lập giá mặc định và quản lý các chính sách giá trong hệ thống"
        />

        <div className={cardUI.base}>
          <div className={cardUI.body}>
            <PricePolicySettings
              settings={settings}
              policies={policies}
            />
          </div>
        </div>

        <div className={cardUI.base}>
          <div className={cardUI.body}>
            <PricePolicyTable policies={policies} />
          </div>
        </div>
      </div>
    </div>
  );
}
