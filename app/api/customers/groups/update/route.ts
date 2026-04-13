// app/api/customers/groups/update/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    const body = await req.json();
    const { id, group_name, note } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID nhóm khách hàng" },
        { status: 400 }
      );
    }

    if (!group_name || !group_name.trim()) {
      return NextResponse.json(
        { error: "Tên nhóm là bắt buộc" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXIST ================= */
    const { data: existingGroup, error: findErr } =
      await supabase
        .from("system_customer_groups")
        .select("id, is_default")
        .eq("id", id)
        .eq("tenant_id", tenant_id)
        .single();

    if (findErr || !existingGroup) {
      return NextResponse.json(
        {
          error:
            "Nhóm khách hàng không tồn tại hoặc đã bị xoá",
        },
        { status: 404 }
      );
    }

    /* ================= UPDATE ================= */
    const { data, error } = await supabase
      .from("system_customer_groups")
      .update({
        group_name: group_name.trim(),
        note: note?.trim() || null,
      })
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .select(`
        id,
        group_code,
        group_name,
        note,
        is_default,
        customer_count
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      group: data,
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
