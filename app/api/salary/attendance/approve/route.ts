import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= AUTH ================= */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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

    const { data: userInfo, error: userError } = await supabase
      .from("system_user")
      .select("user_type")
      .eq("system_user_id", user.id)
      .maybeSingle();

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    const userType = userInfo?.user_type;

    // 🔒 CHỈ CHO PHÉP DUYỆT
    if (!["tenant", "admin", "manager"].includes(userType)) {
      return NextResponse.json(
        { error: "Bạn không có quyền duyệt chấm công" },
        { status: 403 }
      );
    }

    /* ================= BODY ================= */

    const body = await req.json();
    const { staff_ids, work_date } = body;

    if (
      !work_date ||
      !staff_ids ||
      !Array.isArray(staff_ids) ||
      staff_ids.length === 0
    ) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= UPDATE ================= */

    const { error } = await supabase
      .from("system_salary_attendance")
      .update({
        approved: true,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("tenant_id", tenant_id)
      .eq("work_date", work_date)
      .in("staff_id", staff_ids)
      .eq("approved", false); // 🔥 tránh duyệt lại

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      approved_count: staff_ids.length,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}