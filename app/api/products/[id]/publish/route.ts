import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const body = await req.json();

    const {
      name,

      category_id,
      brand_id,
      tag_ids,
      is_sell_online,

      description_html,
      description_image_urls,

      sku,
      barcode,
      weight,
      weight_unit,
      unit,

      prices,
      product_images,

      attributes,
      attribute_values,

      variants,
      variant_prices,

      /* 🔥 NEW */
      units,
      unit_prices,
    } = body || {};

    /* ================= VALIDATE ================= */
    const safeName = String(name ?? "").trim();
    if (!safeName) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên sản phẩm" },
        { status: 400 }
      );
    }

    /* ================= DESCRIPTION IMAGES ================= */
    const imageUrls = Array.isArray(description_image_urls)
      ? description_image_urls
          .map((u: any) => String(u).trim())
          .filter(Boolean)
      : [];

    /* ================= PRODUCT IMAGES ================= */
    const productImages = Array.isArray(product_images)
      ? product_images.map((img: any, index: number) => ({
          image_url: String(img.image_url).trim(),
          is_primary: index === 0,
          sort_order: index,
        }))
      : [];

    /* ================= ROOT PRICES ================= */
    let p_prices: Record<string, number> = {};
    if (prices && Object.keys(prices).length > 0) {
      for (const policyId of Object.keys(prices)) {
        const price = prices[policyId];
        if (typeof price === "number") {
          p_prices[policyId] = price;
        }
      }
    }

    /* ================= ATTRIBUTES ================= */
    const p_attributes =
      Array.isArray(attributes) && attributes.length > 0
        ? attributes.map((a: any, index: number) => ({
            name: String(a.name).trim(),
            sort_order:
              typeof a.sort_order === "number"
                ? a.sort_order
                : index,
          }))
        : null;

    const p_attribute_values =
      Array.isArray(attribute_values) &&
      attribute_values.length > 0
        ? attribute_values.map((a: any) => ({
            name: String(a.name).trim(),
            values: Array.isArray(a.values)
              ? a.values
                  .map((v: any) => String(v).trim())
                  .filter(Boolean)
              : [],
          }))
        : null;

    /* ================= VARIANTS ================= */
    const p_variants =
      Array.isArray(variants) && variants.length > 0
        ? variants.map((v: any) => ({
            key: v.key,
            name: v.name,
            sku: v.sku ?? null,
            weight: v.weight ?? null,
            weight_unit: v.weight_unit ?? "g",
			image_path: v.image_path ?? null,
          }))
        : null;

    const p_variant_prices =
      Array.isArray(variant_prices) &&
      variant_prices.length > 0
        ? variant_prices
        : null;

    /* ================= UNIT CONVERSIONS ================= */

    const p_units =
      Array.isArray(units) && units.length > 0
        ? units.map((u: any) => ({
            variant_key: u.variant_key,
            base_unit: unit ?? null, // root unit
            convert_unit: u.convert_unit,
            factor: u.factor,
			unit_name: u.unit_name,
            sku: u.sku ?? null,
            barcode: u.barcode ?? null,
            weight: u.weight ?? null,
            weight_unit: u.weight_unit ?? "g",
            image_path: u.image_path ?? null,
            is_sell_online: true,
          }))
        : null;

    const p_unit_prices =
      Array.isArray(unit_prices) &&
      unit_prices.length > 0
        ? unit_prices
        : null;

    /* ================= CALL RPC ================= */

    const { error } = await supabase.rpc(
      "publish_product",
      {
        p_product_id: productId,
        p_name: safeName,

        p_category_id: category_id ?? null,
        p_brand_id: brand_id ?? null,
        p_tag_ids: tag_ids ?? [],
        p_is_sell_online: is_sell_online ?? true,

        p_description_html: description_html ?? null,
        p_description_image_urls: imageUrls,

        p_sku: sku ?? null,
        p_barcode: barcode ?? null,
        p_weight: weight ?? null,
        p_weight_unit: weight_unit ?? "g",
        p_unit: unit ?? null,

        p_prices,
        p_product_images: productImages,

        p_attributes,
        p_attribute_values,
        p_variants,
        p_variant_prices,

        /* 🔥 NEW */
        p_units,
        p_unit_prices,
      }
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product_id: productId,
    });

  } catch (err: any) {

    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Publish failed" },
      { status: 500 }
    );
  }
}
