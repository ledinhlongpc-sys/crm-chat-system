import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/suppliers/group/create
   - Tạo nhóm nhà cung cấp theo tenant
   - Tự sinh group_code trong API (không dùng helper)
   - Format: GRP0001
====================================================== */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== TENANT ===== */
    const tenant_id = await getTenantId(supabase);

    /* ===== BODY ===== */
    const body = await req.json().catch(() => null);

    const group_name = body?.group_name?.trim();
    const note = body?.note ?? null;
    const is_active = body?.is_active ?? true;

    if (!group_name) {
      return NextResponse.json(
        { error: "Thiếu tên nhóm nhà cung cấp" },
        { status: 400 }
      );
    }

    /* ===== AUTO CODE ==========================
       Format: GRP0001
       - Tăng theo tenant
       - Không dùng trigger / helper
    ========================================== */
    const { data: lastGroup, error: lastErr } = await supabase
      .from("system_supplier_group")
      .select("group_code")
      .eq("tenant_id", tenant_id)
      .order("group_code", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) {
      throw lastErr;
    }

    let nextNumber = 1;
    if (lastGroup?.group_code) {
      const match = lastGroup.group_code.match(/\d+$/);
      if (match) {
        nextNumber = Number(match[0]) + 1;
      }
    }

    const group_code = `GRP${String(nextNumber).padStart(4, "0")}`;

    /* ===== INSERT ===== */
    const { data, error } = await supabase
      .from("system_supplier_group")
      .insert({
        tenant_id,
        group_code,
        group_name,
        note,
        is_active,
      })
      .select("id, group_code, group_name")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Tạo nhóm nhà cung cấp thất bại" },
        { status: 500 }
      );
    }

    /* ===== RESPONSE ===== */
    return NextResponse.json(
      {
        success: true,
        ...data,
      },
      { status: 201 }
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
