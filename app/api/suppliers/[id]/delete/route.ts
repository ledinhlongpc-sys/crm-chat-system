import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   DELETE /api/suppliers/[id]/delete
   - Xóa 1 nhà cung cấp theo tenant
====================================================== */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    /* ===== PARAM ===== */
    const { id: supplierId } = await context.params;

    if (!supplierId) {
      return NextResponse.json(
        { error: "Thiếu ID nhà cung cấp" },
        { status: 400 }
      );
    }

    /* ===== CHECK SUPPLIER ===== */
    const { data: supplier, error: fetchErr } =
      await supabase
        .from("system_supplier")
        .select("id, current_debt")
        .eq("id", supplierId)
        .eq("tenant_id", tenant_id)
        .single();

    if (fetchErr || !supplier) {
      return NextResponse.json(
        { error: "Nhà cung cấp không tồn tại" },
        { status: 404 }
      );
    }

    /* ===== BUSINESS RULE ===== */
    if (supplier.current_debt > 0) {
      return NextResponse.json(
        { error: "Không thể xóa nhà cung cấp còn công nợ" },
        { status: 400 }
      );
    }

    /* ===== DELETE ===== */
    const { error: delErr } = await supabase
      .from("system_supplier")
      .delete()
      .eq("id", supplierId)
      .eq("tenant_id", tenant_id);

    if (delErr) {
      return NextResponse.json(
        { error: delErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
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
