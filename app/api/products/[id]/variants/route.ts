import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/products/[id]/variants/create
   - Tạo mới 1 variant
   - Có thể tạo attribute + attribute_value
====================================================== */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);
    const { id: product_id } = await context.params;

    if (!product_id) {
      return NextResponse.json(
        { error: "Thiếu product_id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const attribute_id_input = body?.attribute_id ?? null;
    const attribute_name_input = String(body?.attribute_name ?? "").trim();
    const value_input = String(body?.value ?? "").trim();

    if (!value_input) {
      return NextResponse.json(
        { error: "Giá trị không được để trống" },
        { status: 400 }
      );
    }

    /* =============================
       1️⃣ TẠO / LẤY ATTRIBUTE
    ============================= */

    let attribute_id = attribute_id_input;

    if (!attribute_id) {
      if (!attribute_name_input) {
        return NextResponse.json(
          { error: "Thiếu tên thuộc tính" },
          { status: 400 }
        );
      }

      const { data: createdAttr, error: attrErr } = await supabase
        .from("system_product_attributes")
        .insert({
          tenant_id,
          product_id,
          name: attribute_name_input,
          sort_order: 0,
        })
        .select("id")
        .single();

      if (attrErr) throw attrErr;

      attribute_id = createdAttr.id;
    }

    /* =============================
       2️⃣ TẠO ATTRIBUTE VALUE
    ============================= */

    const { data: createdValue, error: valueErr } = await supabase
      .from("system_product_attribute_values")
      .insert({
        tenant_id,
        product_id,
        attribute_id,
        value: value_input,
        sort_order: 0,
      })
      .select("id")
      .single();

    if (valueErr) throw valueErr;

    const attribute_value_id = createdValue.id;

    /* =============================
       3️⃣ SINH SKU (THEO TENANT)
    ============================= */

    const { data: maxSkuRow } = await supabase
      .from("system_product_variants")
      .select("sku")
      .eq("tenant_id", tenant_id)
      .order("created_at", { ascending: false })
      .limit(1);

    let nextNumber = 10001;

    if (maxSkuRow && maxSkuRow.length > 0) {
      const lastSku = maxSkuRow[0]?.sku;
      if (lastSku) {
        const numeric = Number(lastSku.replace(/\D/g, ""));
        if (!isNaN(numeric)) {
          nextNumber = numeric + 1;
        }
      }
    }

    const newSku = `SKU${nextNumber}`;
    const newBarcode = newSku;

    /* =============================
       4️⃣ LẤY VARIANT MẶC ĐỊNH
    ============================= */

    const { data: defaultVariant } = await supabase
      .from("system_product_variants")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("product_id", product_id)
      .eq("is_default", true)
      .maybeSingle();

    /* =============================
       5️⃣ INSERT VARIANT MỚI
    ============================= */

    const { data: newVariant, error: variantErr } = await supabase
      .from("system_product_variants")
      .insert({
        tenant_id,
        product_id,
        variant_name: value_input,
        sku: newSku,
        barcode: newBarcode,
        weight: defaultVariant?.weight ?? null,
        weight_unit: defaultVariant?.weight_unit ?? "g",
        base_price: defaultVariant?.base_price ?? 0,
        cost_price: defaultVariant?.cost_price ?? 0,
        image_url: defaultVariant?.image_url ?? null,
        is_active: true,
        is_sell_online: defaultVariant?.is_sell_online ?? true,
        is_default: false,
      })
      .select("id")
      .single();

    if (variantErr) throw variantErr;

    const variant_id = newVariant.id;

    /* =============================
       6️⃣ CLONE GIÁ
    ============================= */

    if (defaultVariant) {
      const { data: defaultPrices } = await supabase
        .from("system_product_variant_prices")
        .select("price_policy_id, price")
        .eq("tenant_id", tenant_id)
        .eq("variant_id", defaultVariant.id);

      if (defaultPrices && defaultPrices.length > 0) {
        const rows = defaultPrices.map((p) => ({
          tenant_id,
          variant_id,
          price_policy_id: p.price_policy_id,
          price: p.price,
        }));

        await supabase
          .from("system_product_variant_prices")
          .insert(rows);
      }
    }

    /* =============================
       7️⃣ MAP ATTRIBUTE ↔ VARIANT
    ============================= */

    await supabase
      .from("system_product_variant_attribute_values")
      .insert({
        tenant_id,
        variant_id,
        attribute_id,
        attribute_value_id,
      });

    return NextResponse.json(
      { success: true, variant_id },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    console.error("CREATE variant error:", err);

    return NextResponse.json(
      { error: err?.message || "Không thể tạo phiên bản" },
      { status: 500 }
    );
  }
}
