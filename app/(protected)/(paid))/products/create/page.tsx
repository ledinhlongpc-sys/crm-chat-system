// app/(protected)/(paid)/products/create/page.tsx

import CreateProductClient from "./CreateProductClient";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import { pageUI } from "@/ui-tokens";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import CreateProductHeaderActions from "./CreateProductHeaderActions";
export default async function CreateProductPage() {
  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  const [
    categoriesRes,
    brandsRes,
    pricePoliciesRes,
  ] = await Promise.all([
    supabase
      .from("system_product_categories")
      .select("id, name, parent_id, sort_order, is_active")
      .eq("tenant_id", tenant_id)
      .eq("is_active", true)
      .order("sort_order"),

    supabase
      .from("system_product_brands")
      .select("id, name")
      .eq("tenant_id", tenant_id)
      .order("name"),

    supabase
      .from("system_price_policies")
      .select("id, ten_chinh_sach, ma_chinh_sach, loai_gia, sort_order")
      .eq("tenant_id", tenant_id)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
	       
        <CreateProductClient
          categories={categoriesRes.data ?? []}
          brands={brandsRes.data ?? []}
          pricePolicies={pricePoliciesRes.data ?? []}
        />
      </div>
    </div>
  );
}
