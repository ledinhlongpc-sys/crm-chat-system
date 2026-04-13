import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const tenant_id = await getTenantId(supabase);

    const body = await req.json();
    const { id, staff_id, amount, reason, note, penalty_date } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
    }

    /* ================= CHECK STATUS ================= */

    const { data: current } = await supabase
      .from("system_salary_penalties")
      .select("status")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .single();

    if (current?.status === "confirmed") {
      return NextResponse.json(
        { error: "Phiếu đã duyệt không thể sửa" },
        { status: 400 }
      );
    }

    const date = new Date(penalty_date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const { error } = await supabase
      .from("system_salary_penalties")
      .update({
        staff_id,
        amount: Number(amount),
        reason: reason || null,
        note: note || null,
        penalty_date,
        month,
        year,
      })
      .eq("id", id)
      .eq("tenant_id", tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}