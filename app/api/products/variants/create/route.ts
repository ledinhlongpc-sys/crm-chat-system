import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/* ======================================================
   POST /api/products/[id]/variants/create
   - id = product_id (UUID)
   - body: { base_variant_id?: uuid }
   - Logic:
     1. gọi RPC create_product_variant_full
     2. load đầy đủ variant + prices + attributes
     3. trả object variant cho FE append
====================================================== */

export async function POST(
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

  const systemUserId = user.id;

  /* ================= PARAM ================= */
  const { id: productId } = await context.params;

  if (!productId || !/^[0-9a-fA-F-]{36}$/.test(productId)) {
    return NextResponse.json(
      { error: "Invalid product id" },
      { status: 400 }
    );
  }

  /* ================= BODY ================= */
  let body: { base_variant_id?: string };

  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { base_variant_id } = body;

  if (
    base_variant_id &&
    !/^[0-9a-fA-F-]{36}$/.test(base_variant_id)
  ) {
    return NextResponse.json(
      { error: "Invalid base_variant_id" },
      { status: 400 }
    );
  }

  /* ================= CALL RPC ================= */
  const { data: newVariantId, error: rpcErr } =
    await supabase.rpc("create_product_variant_full", {
      p_product_id: productId,
      p_base_variant_id: base_variant_id ?? null,
    });

  if (rpcErr || !newVariantId) {
    console.error("[create variant rpc error]", rpcErr);
    return NextResponse.json(
      {
        error: "Không thể tạo phiên bản",
        detail: rpcErr?.message,
      },
      { status: 500 }
    );
  }

  /* ================= LOAD VARIANT ================= */
  const { data: variantRow, error: variantErr } =
    await supabase
      .from("system_product_variants")
      .select(`
        id,
        variant_name,
        sku,
        barcode,
        weight,
        weight_unit,
        unit,
        image_url,
        is_default,
        is_active
      `)
      .eq("id", newVariantId)
      .eq("system_user_id", systemUserId)
      .single();

  if (variantErr || !variantRow) {
    return NextResponse.json(
      { error: "Variant not found after create" },
      { status: 500 }
    );
  }

  /* ================= LOAD PRICE POLICIES ================= */
  const { data: policies } = await supabase
    .from("system_price_policies")
    .select("id, ten_chinh_sach, sort_order")
    .eq("system_user_id", systemUserId)
    .order("sort_order", { ascending: true });

  /* ================= LOAD VARIANT PRICES ================= */
  const { data: priceRows } = await supabase
    .from("system_product_variant_prices")
    .select("price_policy_id, price")
    .eq("system_user_id", systemUserId)
    .eq("variant_id", newVariantId);

  const priceMap = new Map(
    (priceRows ?? []).map((p: any) => [
      p.price_policy_id,
      p.price != null ? Number(p.price) : null,
    ])
  );

  const prices =
    (policies ?? []).map((p: any) => ({
      policy_id: p.id,
      policy_name: p.ten_chinh_sach,
      sort_order: p.sort_order ?? null,
      price: priceMap.get(p.id) ?? null,
    }));

  /* ================= LOAD VARIANT ATTRIBUTES ================= */
  const { data: attrRows } = await supabase
    .from("system_product_variant_attribute_values")
    .select(`
      attribute_id,
      attribute:system_product_attributes (
        name
      ),
      attribute_value:system_product_attribute_values (
        id,
        value
      )
    `)
    .eq("system_user_id", systemUserId)
    .eq("variant_id", newVariantId);

  const attributes =
    (attrRows ?? []).map((r: any) => ({
      attribute_id: r.attribute_id,
      attribute_name: r.attribute?.name ?? "",
      attribute_value_id: r.attribute_value?.id ?? null,
      value: r.attribute_value?.value ?? null,
    }));

  /* ================= RETURN ================= */
  return NextResponse.json({
    success: true,
    variant_id: newVariantId,
    variant: {
      id: variantRow.id,
      name: variantRow.variant_name ?? "Phiên bản mới",

      sku: variantRow.sku ?? null,
      barcode: variantRow.barcode ?? null,

      weight: variantRow.weight ?? null,
      weight_unit: variantRow.weight_unit ?? null,
      unit: variantRow.unit ?? null,

      image: variantRow.image_url ?? null,

      is_default: !!variantRow.is_default,
      is_active: !!variantRow.is_active,

      inventory: {
        stock_qty: 0,
        outgoing_qty: 0,
        available_qty: 0,
      },

      prices,
      attributes,
    },
  });
}
