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

    const { data: userInfo, error: userError } = await supabase
      .from("system_user")
      .select("user_type")
      .eq("system_user_id", user.id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    const userType = userInfo?.user_type?.toLowerCase();

    if (!userType) {
      return NextResponse.json(
        { error: "USER_NOT_FOUND_IN_TENANT" },
        { status: 403 }
      );
    }

    if (!["tenant", "admin", "manager"].includes(userType)) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa lương" },
        { status: 403 }
      );
    }

    /* ================= BODY ================= */

    const body = await req.json();

    const {
      staff_id,
      salary_type,
      base_salary,
      salary_per_hour,
      ot_rate,
      commission_percent,

      // 🔥 NEW
      ot_rate_sunday,
      ot_rate_holiday,
      is_holiday_paid,
    } = body;

    /* ================= VALIDATE ================= */

    if (!staff_id) {
      return NextResponse.json(
        { error: "STAFF_ID_REQUIRED" },
        { status: 400 }
      );
    }

    if (!salary_type) {
      return NextResponse.json(
        { error: "SALARY_TYPE_REQUIRED" },
        { status: 400 }
      );
    }

    /* ================= VALIDATE STAFF ================= */

    const { data: staff, error: staffError } = await supabase
      .from("system_salary_staffs")
      .select("id")
      .eq("tenant_id", tenant_id)
      .eq("id", staff_id)
      .maybeSingle();

    if (staffError || !staff) {
      return NextResponse.json(
        { error: "NHAN_VIEN_KHONG_TON_TAI" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXIST ================= */

    const { data: existing } = await supabase
      .from("system_salary_configs")
      .select("id")
      .eq("tenant_id", tenant_id)
      .eq("staff_id", staff_id)
      .maybeSingle();

    /* ================= BUILD DATA ================= */

    const baseData = {
      salary_type,
      base_salary: base_salary ?? 0,
      salary_per_hour: salary_per_hour ?? 0,
      ot_rate: ot_rate ?? 1.5,
      commission_percent: commission_percent ?? 0,
    };


    const extraData =
  salary_type === "commission"
    ? {
        ot_rate_sunday: null,
        ot_rate_holiday: null,
        is_holiday_paid: null,
      }
    : {
        ot_rate_sunday: ot_rate_sunday ?? 2,
        ot_rate_holiday: ot_rate_holiday ?? 3,
        is_holiday_paid:
          typeof is_holiday_paid === "boolean"
            ? is_holiday_paid
            : true,
      };

    const finalData = {
      ...baseData,
      ...extraData,
    };

    /* ================= UPSERT ================= */

    if (existing) {
      const { error: updateError } = await supabase
        .from("system_salary_configs")
        .update(finalData)
        .eq("id", existing.id)
        .eq("tenant_id", tenant_id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        mode: "update",
      });
    }

    const { error: insertError } = await supabase
      .from("system_salary_configs")
      .insert({
        tenant_id,
        staff_id,
        ...finalData,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: "insert",
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}