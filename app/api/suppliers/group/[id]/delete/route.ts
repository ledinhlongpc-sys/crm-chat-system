import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   DELETE /api/suppliers/group/[id]/delete
   - Xóa 1 nhóm nhà cung cấp theo tenant
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
    const { id: groupId } = await context.params;

    if (!groupId) {
      return NextResponse.json(
        { error: "Thiếu ID nhóm nhà cung cấp" },
        { status: 400 }
      );
    }

    /* ===== CHECK GROUP ===== */
    const { data: group, error: fetchErr } =
      await supabase
        .from("system_supplier_group")
        .select("id, is_default")
        .eq("id", groupId)
        .eq("tenant_id", tenant_id)
        .single();

    if (fetchErr || !group) {
      return NextResponse.json(
        { error: "Nhóm nhà cung cấp không tồn tại" },
        { status: 404 }
      );
    }

    /* ===== BUSINESS RULE 1: KHÔNG XÓA GROUP DEFAULT ===== */
    if (group.is_default) {
      return NextResponse.json(
        { error: "Không thể xóa nhóm nhà cung cấp mặc định" },
        { status: 400 }
      );
    }

    /* ===== BUSINESS RULE 2: CHECK ĐANG ĐƯỢC SỬ DỤNG ===== */
    const { count, error: countErr } = await supabase
      .from("system_supplier")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant_id)
      .eq("supplier_group_id", groupId);

    if (countErr) {
      return NextResponse.json(
        { error: countErr.message },
        { status: 500 }
      );
    }

    if (count && count > 0) {
      return NextResponse.json(
        {
          error:
            "Không thể xóa nhóm nhà cung cấp đang được sử dụng",
        },
        { status: 400 }
      );
    }

    /* ===== DELETE ===== */
    const { error: delErr } = await supabase
      .from("system_supplier_group")
      .delete()
      .eq("id", groupId)
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
