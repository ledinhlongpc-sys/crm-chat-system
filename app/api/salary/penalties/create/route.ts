import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= AUTH ================= */

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    /* ================= TENANT ================= */

    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    /* ================= ROLE ================= */

    const { data: userInfo } = await supabase
      .from("system_user")
      .select("user_type")
      .eq("system_user_id", user.id)
      .eq("tenant_id", tenant_id)
      .single();

    if (!["tenant", "admin", "manager"].includes(userInfo?.user_type)) {
      return NextResponse.json(
        { error: "Không có quyền tạo phiếu phạt" },
        { status: 403 }
      );
    }

    /* ================= BODY ================= */

    const body = await req.json();

    let { staff_id, amount, reason, note, penalty_date } = body;

    /* ================= VALIDATE ================= */

    if (!staff_id) {
      return NextResponse.json({ error: "Thiếu nhân viên" }, { status: 400 });
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    if (!penalty_date) {
      return NextResponse.json(
        { error: "Thiếu ngày phạt" },
        { status: 400 }
      );
    }

    /* ================= CHECK STAFF ================= */

    const { data: staff } = await supabase
      .from("system_salary_staffs")
      .select("id")
      .eq("id", staff_id)
      .eq("tenant_id", tenant_id)
      .single();

    if (!staff) {
      return NextResponse.json(
        { error: "Nhân viên không tồn tại" },
        { status: 400 }
      );
    }

    /* ================= AUTO MONTH/YEAR ================= */

    const date = new Date(penalty_date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    /* ================= INSERT ================= */

    const { data, error } = await supabase
      .from("system_salary_penalties")
      .insert([
        {
          tenant_id,
          staff_id,
          amount: Number(amount),
          reason: reason || null,
          note: note || null,
          penalty_date,
          month,
          year,
          status: "draft",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}