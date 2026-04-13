import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   PATCH /api/suppliers/group/[id]/status
   - Cập nhật trạng thái (is_active) nhóm nhà cung cấp
====================================================== */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
){
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== TENANT ===== */
    const tenant_id = await getTenantId(supabase);

    /* ===== PARAM ===== */
   const { id: groupId } = await context.params;

    if (!groupId) {
      return NextResponse.json(
        { error: "Thiếu ID nhóm nhà cung cấp" },
        { status: 400 }
      );
    }

    /* ===== BODY ===== */
    const body = await req.json().catch(() => null);
    const is_active = body?.is_active;

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    /* ===== LOAD GROUP ===== */
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

    /* ===== BUSINESS RULE =====
       Không cho tắt nhóm mặc định
    ================================= */
    if (group.is_default && is_active === false) {
      return NextResponse.json(
        {
          error:
            "Không thể ngưng hoạt động nhóm nhà cung cấp mặc định",
        },
        { status: 400 }
      );
    }

    /* ===== UPDATE STATUS ===== */
    const { error: updateErr } = await supabase
      .from("system_supplier_group")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)
      .eq("tenant_id", tenant_id);

    if (updateErr) {
      return NextResponse.json(
        { error: updateErr.message },
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
