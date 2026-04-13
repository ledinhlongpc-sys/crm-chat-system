// app/api/suppliers/[id]/update/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";



/* ======================================================
   PATCH /api/suppliers/[id]/update
   - Cập nhật nhà cung cấp theo tenant
====================================================== */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT CONTEXT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= PARAM ================= */
    const { id: supplierId } = await context.params;

    if (!supplierId) {
      return NextResponse.json(
        { error: "Thiếu ID nhà cung cấp" },
        { status: 400 }
      );
    }

    /* ================= BODY ================= */
    const body = await req.json();

    const supplier_name = body?.supplier_name?.trim();
    const phone = body?.phone ?? null;
    const email = body?.email ?? null;
    const address = body?.address ?? null;
    const supplier_group_id =
      body?.supplier_group_id || null;

    if (!supplier_name) {
      return NextResponse.json(
        { error: "Tên nhà cung cấp là bắt buộc" },
        { status: 400 }
      );
    }

    /* ================= CHECK SUPPLIER =================
       - Đảm bảo NCC tồn tại & thuộc tenant
    =================================================== */
    const { data: supplier, error: fetchErr } =
      await supabase
        .from("system_supplier")
        .select("id")
        .eq("id", supplierId)
        .eq("tenant_id", tenant_id)
        .maybeSingle();

    if (fetchErr || !supplier) {
      return NextResponse.json(
        { error: "Nhà cung cấp không tồn tại" },
        { status: 404 }
      );
    }

    /* ================= UPDATE ================= */
    const { error: updateErr } = await supabase
      .from("system_supplier")
      .update({
        supplier_name,
        phone,
        email,
        address,
        supplier_group_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", supplierId)
      .eq("tenant_id", tenant_id);

    if (updateErr) {
      return NextResponse.json(
        { error: updateErr.message },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */
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
