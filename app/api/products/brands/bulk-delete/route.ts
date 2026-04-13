// app/api/products/Brand/bulk-delete/route.ts



import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    /* ===== BODY ===== */
    let body: { ids?: string[] };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Body không hợp lệ" },
        { status: 400 }
      );
    }

    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Danh sách ID rỗng" },
        { status: 400 }
      );
    }

    /* ===== CHECK PRODUCT COUNT ===== */
    const { data: brands, error: checkErr } =
      await supabase
        .from("system_product_brands")
        .select("id, product_count")
        .in("id", ids)
        .eq("tenant_id", tenant_id);

    if (checkErr) {
      return NextResponse.json(
        { error: checkErr.message },
        { status: 500 }
      );
    }

    const blocked = brands?.filter(
      (b) => (b.product_count ?? 0) > 0
    );

    if (blocked && blocked.length > 0) {
      return NextResponse.json(
        {
          error:
            "Không thể xóa nhãn hiệu đang có sản phẩm",
          blocked_ids: blocked.map((b) => b.id),
        },
        { status: 400 }
      );
    }

    /* ===== DELETE BRANDS ===== */
    const { error, count } = await supabase
      .from("system_product_brands")
      .delete({ count: "exact" })
      .in("id", ids)
      .eq("tenant_id", tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted_count: count ?? 0,
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
