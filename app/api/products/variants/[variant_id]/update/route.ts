import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function PUT(
  req: Request,
  context: { params: Promise<{ variant_id: string }> }
) {
  try {
    const { variant_id } = await context.params;

    if (!variant_id) {
      return NextResponse.json(
        { error: "Thiếu variant_id" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const body = await req.json();

    const {
      product_id,
      name,
      sku,
      barcode,
      weight,
      weight_unit,
      is_active,
      image,
      prices,

      // ⭐ thêm
      convert_unit,
      factor,
	  attributes,
    } = body || {};

    const safeName = String(name ?? "").trim();
    const safeSku = String(sku ?? "").trim();

    if (!safeName) {
      return NextResponse.json(
        { error: "Tên phiên bản không được để trống" },
        { status: 400 }
      );
    }

    if (!safeSku) {
      return NextResponse.json(
        { error: "SKU không được để trống" },
        { status: 400 }
      );
    }

    const finalBarcode =
      barcode && String(barcode).trim()
        ? String(barcode).trim()
        : safeSku;

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

    // ⭐ chuẩn hóa convert_unit
    const finalConvertUnit =
      convert_unit && String(convert_unit).trim()
        ? String(convert_unit).trim()
        : null;

    // ⭐ chuẩn hóa factor
    const finalFactor =
      typeof factor === "number"
        ? factor
        : factor
        ? Number(factor)
        : null;

    // convert prices array -> jsonb object
    const p_prices: Record<string, number> = {};

    if (Array.isArray(prices)) {
      for (const p of prices) {
        const pid = String(p?.policy_id ?? "").trim();
        const val = p?.price;

        if (!pid) continue;
        if (typeof val === "number" && !isNaN(val)) {
          p_prices[pid] = val;
        }
      }
    }

    const { error } = await supabase.rpc(
      "product_update_variant_level2",
      {
        p_variant_id: variant_id,
        p_product_id: product_id ?? null,
        p_name: safeName,
        p_sku: safeSku,
        p_barcode: finalBarcode,
        p_weight: finalWeight,
        p_weight_unit: finalWeightUnit,
        p_is_active:
          typeof is_active === "boolean"
            ? is_active
            : true,
        p_image_url: image ?? null,
        p_prices,

        // ⭐ truyền thêm xuống SQL
        p_convert_unit: finalConvertUnit,
        p_factor: finalFactor,
		p_attributes: attributes ?? null,
      }
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
	

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Cập nhật phiên bản thất bại",
      },
      { status: 500 }
    );
  }
}
