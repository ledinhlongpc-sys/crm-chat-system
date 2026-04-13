// app/api/customers/groups/create/route.ts

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
    const { group_name, note } = body;

    if (!group_name || !group_name.trim()) {
      return NextResponse.json(
        { error: "Tên nhóm là bắt buộc" },
        { status: 400 }
      );
    }

    /* ================= INSERT ================= */
    const { data, error } = await supabase
      .from("system_customer_groups")
      .insert({
        tenant_id,
        group_name: group_name.trim(),
        note: note?.trim() || null,
        // customer_count: 0  // 👈 KHÔNG CẦN – default DB lo
      })
      .select("id, group_name")
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
