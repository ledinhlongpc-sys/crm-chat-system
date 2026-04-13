import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function DELETE(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const body = await req.json();
    const variantIds: string[] = body.variant_ids ?? [];
    const unitIds: string[] = body.unit_ids ?? [];

    if (!variantIds.length && !unitIds.length) {
      return NextResponse.json(
        { error: "Không có dữ liệu để xoá" },
        { status: 400 }
      );
    }

    /* ===========================
       1️⃣ XOÁ UNIT ĐƯỢC CHỌN TRỰC TIẾP
    =========================== */
    if (unitIds.length > 0) {
      const { error } = await supabase
        .from("system_product_unit_conversions")
        .delete()
        .in("id", unitIds)
        .eq("tenant_id", tenant_id);

      if (error) {
        return NextResponse.json(
          { error: "Lỗi khi xoá đơn vị quy đổi" },
          { status: 500 }
        );
      }
    }

    /* ===========================
       2️⃣ XOÁ VARIANT
    =========================== */
    if (variantIds.length > 0) {

      /* 🔥 LẤY ATTRIBUTE_VALUE_ID TRƯỚC KHI XOÁ */
      const { data: attrMappings, error: mappingFetchError } =
        await supabase
          .from("system_product_variant_attribute_values")
          .select("attribute_value_id")
          .in("variant_id", variantIds)
          .eq("tenant_id", tenant_id);

      if (mappingFetchError) {
        return NextResponse.json(
          { error: "Lỗi khi lấy mapping thuộc tính" },
          { status: 500 }
        );
      }

      const attributeValueIds = (
        attrMappings ?? []
      )
        .map((m) => m.attribute_value_id)
        .filter(Boolean);

      /* 🔥 XOÁ UNIT CON */
      const { error: unitChildError } = await supabase
        .from("system_product_unit_conversions")
        .delete()
        .in("variant_id", variantIds)
        .eq("tenant_id", tenant_id);

      if (unitChildError) {
        return NextResponse.json(
          { error: "Lỗi khi xoá đơn vị con của phiên bản" },
          { status: 500 }
        );
      }

      /* 🔥 XOÁ ATTRIBUTE MAP */
      const { error: attrMapError } = await supabase
        .from("system_product_variant_attribute_values")
        .delete()
        .in("variant_id", variantIds)
        .eq("tenant_id", tenant_id);

      if (attrMapError) {
        return NextResponse.json(
          { error: "Lỗi khi xoá mapping thuộc tính" },
          { status: 500 }
        );
      }

      /* 🔥 XOÁ BẢNG GIÁ */
      const { error: priceError } = await supabase
        .from("system_product_variant_prices")
        .delete()
        .in("variant_id", variantIds)
        .eq("tenant_id", tenant_id);

      if (priceError) {
        return NextResponse.json(
          { error: "Lỗi khi xoá bảng giá phiên bản" },
          { status: 500 }
        );
      }

      /* 🔥 SOFT DELETE VARIANT */
      const { error: variantError } = await supabase
        .from("system_product_variants")
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in("id", variantIds)
        .eq("tenant_id", tenant_id);

      if (variantError) {
        return NextResponse.json(
          { error: "Lỗi khi xoá phiên bản" },
          { status: 500 }
        );
      }

      /* ===========================
         3️⃣ DỌN RÁC ATTRIBUTE_VALUE
      =========================== */
      if (attributeValueIds.length > 0) {

        // Kiểm tra còn mapping nào dùng value này không
        const { data: stillUsed } = await supabase
          .from("system_product_variant_attribute_values")
          .select("attribute_value_id")
          .in("attribute_value_id", attributeValueIds)
          .eq("tenant_id", tenant_id);

        const stillUsedSet = new Set(
          (stillUsed ?? []).map((r) => r.attribute_value_id)
        );

        const orphanValueIds = attributeValueIds.filter(
          (id) => !stillUsedSet.has(id)
        );

        if (orphanValueIds.length > 0) {
          await supabase
            .from("system_product_attribute_values")
            .delete()
            .in("id", orphanValueIds)
            .eq("tenant_id", tenant_id);
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("DELETE variants error:", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
