// app/api/products/Brand/[id]/delete/route.ts

// app/api/products/Brand/[id]/delete/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  req: Request,
  { params }: Context
) {
  try {
    const { id } = await params; // ✅ Next 15

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID nhãn hiệu" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    /* ===== CHECK PRODUCT COUNT ===== */
    const { data: brand, error: checkErr } =
      await supabase
        .from("system_product_brands")
        .select("product_count")
        .eq("id", id)
        .eq("tenant_id", tenant_id)
        .single();

    if (checkErr || !brand) {
      return NextResponse.json(
        { error: "Nhãn hiệu không tồn tại" },
        { status: 404 }
      );
    }

    if ((brand.product_count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "Không thể xóa nhãn hiệu đang có sản phẩm",
        },
        { status: 400 }
      );
    }

    /* ===== DELETE BRAND ===== */
    const { error } = await supabase
      .from("system_product_brands")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
