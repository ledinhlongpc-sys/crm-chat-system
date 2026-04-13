import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/suppliers/create
   - Tạo nhà cung cấp theo tenant (chủ cửa hàng)
====================================================== */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT CONTEXT =================
       - Resolve tenant_id theo chủ cửa hàng
       - Throw nếu chưa login hoặc chưa setup shop
    =================================================== */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    const body = await req.json();

    const supplier_name = body?.supplier_name?.trim();
    const phone = body?.phone ?? null;
    const email = body?.email ?? null;
    const address = body?.address ?? null;
    const supplier_group_id = body?.supplier_group_id ?? null;

    if (!supplier_name) {
      return NextResponse.json(
        { error: "Tên nhà cung cấp là bắt buộc" },
        { status: 400 }
      );
    }

    /* ================= SUPPLIER CODE =================
       Format: NCC0001 (tăng theo tenant)
    ================================================ */
    const { data: lastSupplier, error: lastErr } = await supabase
      .from("system_supplier")
      .select("supplier_code")
      .eq("tenant_id", tenant_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) {
      throw lastErr;
    }

    let nextNumber = 1;
    if (lastSupplier?.supplier_code) {
      const match = lastSupplier.supplier_code.match(/\d+$/);
      if (match) {
        nextNumber = Number(match[0]) + 1;
      }
    }

    const supplier_code = `NCC${String(nextNumber).padStart(4, "0")}`;

    /* ================= INSERT ================= */
    const { data, error } = await supabase
      .from("system_supplier")
      .insert({
        tenant_id,
        supplier_code,
        supplier_name,
        phone,
        email,
        address,
        supplier_group_id,
        current_debt: 0,
        status: "active",
      })
      .select("id, supplier_code, supplier_name")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Tạo nhà cung cấp thất bại" },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */
    return NextResponse.json(data, { status: 201 });
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
