import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const body = await req.json();

    if (!body?.supplier_name?.trim()) {
      return NextResponse.json(
        { error: "Thiếu tên nhà cung cấp" },
        { status: 400 }
      );
    }

    /* ======================================================
       1️⃣ LẤY SỐ LỚN NHẤT HIỆN TẠI (SQL xử lý)
    ====================================================== */
    const { data: maxRow, error: maxError } = await supabase.rpc(
      "supplier_get_max_number",
      { p_tenant_id: tenant_id }
    );

    if (maxError) {
      return NextResponse.json(
        { error: maxError.message },
        { status: 400 }
      );
    }

    const nextNumber = (maxRow ?? 0) + 1;

    const supplier_code = `NCC${nextNumber
      .toString()
      .padStart(4, "0")}`;

    /* ======================================================
       2️⃣ INSERT
    ====================================================== */
    const { data, error } = await supabase
      .from("system_supplier")
      .insert({
        tenant_id,
        supplier_code,
        supplier_name: body.supplier_name.trim(),
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        supplier_group_id: body.supplier_group_id || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      id: data.id,
      supplier_code: data.supplier_code,
      name: data.supplier_name,
      phone: data.phone,
      address: data.address,
      current_debt: 0,
      total_purchase: 0,
      total_return: 0,
      total_purchase_count: 0,
      total_return_count: 0,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}