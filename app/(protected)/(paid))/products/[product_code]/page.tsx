import ProductView from "./ProductView";
import { getProductView } from "@/lib/domain/products/getProductView";
import { pageUI } from "@/ui-tokens";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getUserContext } from "@/lib/getUserContext";

/* ================= PAGE (SERVER) ================= */

export default async function ProductViewPage({
  params,
}: {
  params: Promise<{ product_code: string }>;
}) {
  const { product_code } = await params;

  const supabase = await createSupabaseServerComponentClient();

  /* ===== USER CONTEXT (NEW) ===== */

  const { tenantId, userType } = await getUserContext(supabase);

  /* ===== DATA ===== */

  const rawData = await getProductView({
    product_code,
    userType,
  });

  const viewData = {
    ...rawData,
    product: {
      ...rawData.product,
      product_code: String(rawData.product.product_code),
    },
  };

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <ProductView data={viewData} />
      </div>
    </div>
  );
}