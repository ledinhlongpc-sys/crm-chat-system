import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/suppliers/group/bulk-delete
   - Xóa 1 hoặc nhiều nhóm nhà cung cấp theo tenant
====================================================== */
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

    /* ===== CHECK GROUP DEFAULT ===== */
    const { data: defaultGroups, error: defaultErr } =
      await supabase
        .from("system_supplier_group")
        .select("id")
        .eq("tenant_id", tenant_id)
        .eq("is_default", true)
        .in("id", ids);

    if (defaultErr) {
      return NextResponse.json(
        { error: defaultErr.message },
        { status: 500 }
      );
    }

    if (defaultGroups && defaultGroups.length > 0) {
      return NextResponse.json(
        {
          error:
            "Không thể xóa nhóm nhà cung cấp mặc định",
        },
        { status: 400 }
      );
    }

    /* ===== CHECK GROUP ĐANG ĐƯỢC SỬ DỤNG ===== */
    const { count: usedCount, error: usedErr } =
      await supabase
        .from("system_supplier")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenant_id)
        .in("supplier_group_id", ids);

    if (usedErr) {
      return NextResponse.json(
        { error: usedErr.message },
        { status: 500 }
      );
    }

    if (usedCount && usedCount > 0) {
      return NextResponse.json(
        {
          error:
            "Không thể xóa nhóm nhà cung cấp đang được sử dụng",
        },
        { status: 400 }
      );
    }

    /* ===== DELETE ===== */
    const { error, count } = await supabase
      .from("system_supplier_group")
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
