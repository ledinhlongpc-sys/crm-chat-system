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
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
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
      .single();

    if (!["tenant", "admin", "manager", "accountant"].includes(userInfo?.user_type)) {
      return NextResponse.json(
        { error: "Không có quyền thanh toán" },
        { status: 403 }
      );
    }

    /* ================= BODY ================= */

    const body = await req.json();
    let { ids } = body;

    if (!ids) {
      return NextResponse.json(
        { error: "Thiếu ids" },
        { status: 400 }
      );
    }

    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "Danh sách rỗng" },
        { status: 400 }
      );
    }

    /* ================= CHECK STATUS ================= */

    const { data: rows } = await supabase
      .from("system_salary_payrolls")
      .select("id, status")
      .in("id", ids)
      .eq("tenant_id", tenant_id);

    const invalid = rows?.filter(r => r.status !== "confirmed");

    if (invalid && invalid.length > 0) {
      return NextResponse.json(
        { error: "Có bảng lương chưa được duyệt" },
        { status: 400 }
      );
    }

    /* ================= UPDATE ================= */

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("system_salary_payrolls")
      .update({
        status: "paid",
        paid_at: now,
        paid_by: user.id,
      })
      .in("id", ids)
      .eq("tenant_id", tenant_id)
      .eq("status", "confirmed"); // 🔥 đảm bảo đúng flow

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paid: ids.length,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}