import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   PATCH /api/suppliers/group/[id]/update
   - Cập nhật nhóm nhà cung cấp theo tenant
====================================================== */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
){
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

    /* ===== LOAD CURRENT GROUP ===== */
    const { data: currentGroup, error: fetchErr } =
      await supabase
        .from("system_supplier_group")
        .select("id, is_default")
        .eq("id", groupId)
        .eq("tenant_id", tenant_id)
        .single();

    if (fetchErr || !currentGroup) {
      return NextResponse.json(
        { error: "Nhóm nhà cung cấp không tồn tại" },
        { status: 404 }
      );
    }

    /* ===== BODY ===== */
    const body = await req.json().catch(() => null);

    const group_name = body?.group_name?.trim();
    const note = body?.note ?? null;
    const is_active =
      typeof body?.is_active === "boolean"
        ? body.is_active
        : undefined;

    const is_default =
      typeof body?.is_default === "boolean"
        ? body.is_default
        : undefined;

    if (!group_name) {
      return NextResponse.json(
        { error: "Tên nhóm nhà cung cấp là bắt buộc" },
        { status: 400 }
      );
    }

    /* ===== BUSINESS RULE 1 =====
       Không cho tắt nhóm mặc định
    ================================= */
    if (
      currentGroup.is_default &&
      is_active === false
    ) {
      return NextResponse.json(
        {
          error:
            "Không thể ngưng hoạt động nhóm nhà cung cấp mặc định",
        },
        { status: 400 }
      );
    }

    /* ===== BUSINESS RULE 2 =====
       Nếu set default → unset các group khác
    ================================= */
    if (is_default === true) {
      const { error: resetErr } = await supabase
        .from("system_supplier_group")
        .update({ is_default: false })
        .eq("tenant_id", tenant_id)
        .neq("id", groupId);

      if (resetErr) {
        return NextResponse.json(
          { error: resetErr.message },
          { status: 500 }
        );
      }
    }

    /* ===== UPDATE ===== */
    const { error: updateErr } = await supabase
      .from("system_supplier_group")
      .update({
        group_name,
        note,
        ...(typeof is_active === "boolean"
          ? { is_active }
          : {}),
        ...(typeof is_default === "boolean"
          ? { is_default }
          : {}),
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
