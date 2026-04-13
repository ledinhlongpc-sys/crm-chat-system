import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/products/[id]/units/create
   - Tạo unit quy đổi cho 1 variant
   - Clone giá + nhân factor trong SQL
====================================================== */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      return NextResponse.json(
        { error: "Tenant không tồn tại" },
        { status: 401 }
      );
    }

    const { id: product_id } = await params;

    if (!product_id) {
      return NextResponse.json(
        { error: "Thiếu product_id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      parent_variant_id,
      convert_unit,
      factor,
    } = body || {};

    if (!parent_variant_id) {
      return NextResponse.json(
        { error: "Thiếu parent_variant_id" },
        { status: 400 }
      );
    }

    const safeConvertUnit = String(convert_unit ?? "").trim();

    if (!safeConvertUnit) {
      return NextResponse.json(
        { error: "Tên đơn vị quy đổi không được để trống" },
        { status: 400 }
      );
    }

    const safeFactor =
      typeof factor === "number"
        ? factor
        : factor
        ? Number(factor)
        : null;

    if (!safeFactor || safeFactor <= 0) {
      return NextResponse.json(
        { error: "Factor phải lớn hơn 0" },
        { status: 400 }
      );
    }

    /* ======================================================
       CALL SQL FUNCTION
    ====================================================== */
    const { data, error } = await supabase.rpc(
      "product_create_unit",
      {
        p_product_id: product_id,
        p_variant_id: parent_variant_id,
        p_convert_unit: safeConvertUnit,
        p_factor: safeFactor,
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
      unit_id: data, // function return uuid
    });

  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Tạo đơn vị quy đổi thất bại",
      },
      { status: 500 }
    );
  }
}
