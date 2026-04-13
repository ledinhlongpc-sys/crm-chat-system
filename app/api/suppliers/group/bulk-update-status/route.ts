// app/api/suppliers/group/bulk-update-status/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/suppliers/group/bulk-update-status
   - Cập nhật trạng thái (is_active) cho nhiều nhóm
   - Multi-tenant chuẩn
   - Không cho tắt nhóm mặc định
====================================================== */

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);
    if (!tenant_id) {
      throw new Error("TENANT_NOT_FOUND");
    }

    /* ================= BODY ================= */
    let body: {
      ids?: string[];
      is_active?: boolean;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Body không hợp lệ" },
        { status: 400 }
      );
    }

    const { ids, is_active } = body;

    /* ================= VALIDATION ================= */
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Danh sách ID rỗng" },
        { status: 400 }
      );
    }

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= BUSINESS RULE =================
       Không cho tắt nhóm mặc định
    ================================================== */
    if (is_active === false) {
      const { data: defaultGroups, error } = await supabase
        .from("system_supplier_group")
        .select("id")
        .eq("tenant_id", tenant_id)
        .eq("is_default", true)
        .in("id", ids);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      if (defaultGroups && defaultGroups.length > 0) {
        return NextResponse.json(
          {
            error:
              "Không thể ngưng hoạt động nhóm nhà cung cấp mặc định",
          },
          { status: 400 }
        );
      }
    }

    /* ================= UPDATE ================= */
    const { data: updatedRows, error } = await supabase
      .from("system_supplier_group")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids)
      .eq("tenant_id", tenant_id)
      .select("id"); // 👈 chuẩn nhất

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    /* ================= NO UPDATE CASE ================= */
    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        { error: "Không có nhóm nào được cập nhật" },
        { status: 400 }
      );
    }

    /* ================= SUCCESS ================= */
    return NextResponse.json({
      success: true,
      updated_count: updatedRows.length,
    });

  } catch (err: any) {
    console.error("Bulk update supplier group error:", err);

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