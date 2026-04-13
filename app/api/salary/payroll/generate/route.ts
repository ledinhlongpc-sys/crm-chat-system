import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    const { staff_ids, month, year } = await req.json();

    if (!Array.isArray(staff_ids) || staff_ids.length === 0) {
      return NextResponse.json({ error: "Thiếu staff_ids" }, { status: 400 });
    }

    if (!month || !year) {
      return NextResponse.json({ error: "Thiếu month/year" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("generate_salary_payrolls", {
      p_tenant_id: tenant_id,
      p_staff_ids: staff_ids,
      p_month: month,
      p_year: year,
      p_created_by: user.id,
    });

    if (error) {
      console.error("RPC generate_salary_payrolls error:", error);
      return NextResponse.json(
        { error: error.message || "Không thể tạo bảng lương" },
        { status: 500 }
      );
    }

    const failed = (data || []).filter((x: any) => !x.success);

    return NextResponse.json({
      success: failed.length === 0,
      data,
      failed_count: failed.length,
    });
  } catch (err) {
    console.error("POST /api/salary/payroll/generate error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}