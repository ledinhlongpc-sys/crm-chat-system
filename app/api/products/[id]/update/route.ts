// app/api/products/[id]/update/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;

    if (!productId) {
      return NextResponse.json(
        { error: "Thiếu productId" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const body = await req.json();

    const {
      name,
      category_id,
      brand_id,
      tag_ids,
      is_sell_online,
      description_html,
      sku,
      barcode,
      weight,
      weight_unit,
      unit,
      prices,
      product_images,
    } = body || {};

    /* =====================================================
       VALIDATE
    ===================================================== */

    const safeName = String(name ?? "").trim();

    if (!safeName) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên sản phẩm" },
        { status: 400 }
      );
    }

    const finalSku =
      sku && String(sku).trim()
        ? String(sku).trim()
        : null;

    if (!finalSku) {
      return NextResponse.json(
        { error: "SKU không được để trống" },
        { status: 400 }
      );
    }

    /* 🔥 AUTO BARCODE = SKU nếu không gửi lên */
    const finalBarcode =
      barcode && String(barcode).trim()
        ? String(barcode).trim()
        : finalSku;

    const finalWeight =
      typeof weight === "number"
        ? weight
        : weight
        ? Number(weight)
        : null;

    const finalWeightUnit =
      weight_unit && String(weight_unit).trim()
        ? String(weight_unit).trim()
        : "g";

    /* =====================================================
       DESCRIPTION IMAGES (extract từ html)
    ===================================================== */

    const descriptionImageUrls =
      typeof description_html === "string"
        ? Array.from(
            description_html.matchAll(
              /<img[^>]+src="([^">]+)"/g
            )
          ).map((m) => m[1])
        : [];

    /* =====================================================
       GALLERY IMAGES
    ===================================================== */

const productImages = Array.isArray(product_images)
  ? product_images
      .map((img: any, index: number) => {
        const url =
          typeof img === "string"
            ? img
            : img?.path ?? img?.url ?? img?.image_url;

        if (!url) return null;

        return {
          image_url: String(url).trim(),
          is_primary: index === 0,
          sort_order: index,
        };
      })
      .filter(Boolean)
  : [];

    /* =====================================================
       ROOT PRICES
    ===================================================== */

    let p_prices: Record<string, number> = {};

    if (prices && typeof prices === "object") {
      for (const policyId of Object.keys(prices)) {
        const value = prices[policyId];

        if (
          typeof value === "number" &&
          !isNaN(value)
        ) {
          p_prices[policyId] = value;
        }
      }
    }

    /* =====================================================
       CALL RPC (LEVEL 1 ONLY)
    ===================================================== */

    const { error } = await supabase.rpc(
      "product_update_level1",
      {
        p_product_id: productId,

        p_name: safeName,
        p_category_id: category_id ?? null,
        p_brand_id: brand_id ?? null,
        p_tag_ids: tag_ids ?? [],
        p_is_sell_online:
          typeof is_sell_online === "boolean"
            ? is_sell_online
            : true,

        p_description_html:
          description_html ?? null,
        p_description_image_urls:
          descriptionImageUrls,

        p_sku: finalSku,
        p_barcode: finalBarcode,
        p_weight: finalWeight,
        p_weight_unit: finalWeightUnit,
        p_unit: unit ?? null,

        p_prices,
        p_product_images: productImages,
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
    if (
      err?.message?.includes("Tenant not found")
    ) {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Cập nhật sản phẩm thất bại",
      },
      { status: 500 }
    );
  }
}
