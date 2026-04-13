import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/* ======================================================
   GET /api/products/[id]/variants
   - id = product_id (UUID)
   - load VARIANT CON (is_default = false)
   - mỗi variant lấy inventory THEO variant_id
   - chuẩn Next.js dynamic params (await)
====================================================== */

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();

  /* ================= AUTH ================= */
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (!user || authErr) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  /* ================= PARAM (NEXT 15 SAFE) ================= */
  const { id: productId } = await context.params;

  // 🔒 Guard UUID (tránh lỗi 22P02)
  if (
    !productId ||
    !/^[0-9a-fA-F-]{36}$/.test(productId)
  ) {
    return NextResponse.json(
      { error: "Invalid product id" },
      { status: 400 }
    );
  }

  /* ================= QUERY VARIANTS ================= */
  const { data, error } = await supabase
    .from("system_product_variants")
    .select(
      `
        id,
        variant_name,
        sku,
        image_url,
        base_price,
        cost_price,

        inventory:system_product_inventory!variant_id (
          stock_qty,
          outgoing_qty
        )
      `
    )
    .eq("system_user_id", user.id)
    .eq("product_id", productId)
    .eq("is_default", false)
    .is("deleted_at", null)
    .order("variant_name");

  if (error) {
    console.error("[variants API error]", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  /* ================= NORMALIZE ================= */
  const variants =
    data?.map((v: any) => {
      const inv = v.inventory?.[0];

      const stock = Number(inv?.stock_qty || 0);
      const outgoing = Number(inv?.outgoing_qty || 0);

      return {
        id: v.id,
        name: v.variant_name,
        sku: v.sku,
        image: v.image_url,

        stock_qty: stock,
        outgoing_qty: outgoing,
        available_qty: stock - outgoing,

        base_price: v.base_price,
        cost_price: v.cost_price,
      };
    }) ?? [];

  /* ================= RESPONSE ================= */
  return NextResponse.json({
    success: true,
    variants,
  });
}
