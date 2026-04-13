import EditProductClient from "./EditProductClient";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getUserContext } from "@/lib/getUserContext";
import { getProductEdit } from "@/lib/domain/products/getProductEdit";
import { pageUI } from "@/ui-tokens";

/* ================= PAGE ================= */

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ product_code: string }>;
}) {
  const { product_code } = await params;

  const supabase =
    await createSupabaseServerComponentClient();

  /* ===== USER CONTEXT (FIX) ===== */
  const { tenantId, userType } = await getUserContext(supabase);

  /* ===== LOAD PRODUCT ===== */
  const productData = await getProductEdit({
    product_code,
    userType,
  });

  /* ================= LOAD FILTER DATA ================= */

  const [
    categoriesRes,
    brandsRes,
    pricePoliciesRes,
  ] = await Promise.all([
    supabase
      .from("system_product_categories")
      .select(
        "id, name, parent_id, sort_order, is_active"
      )
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("sort_order"),

    supabase
      .from("system_product_brands")
      .select("id, name")
      .eq("tenant_id", tenantId)
      .order("name"),

    supabase
      .from("system_price_policies")
      .select(
        "id, ten_chinh_sach, ma_chinh_sach, loai_gia, sort_order"
      )
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <EditProductClient
          initialData={productData}
          categories={categoriesRes.data ?? []}
          brands={brandsRes.data ?? []}
          pricePolicies={pricePoliciesRes.data ?? []}
        />
      </div>
    </div>
  );
}