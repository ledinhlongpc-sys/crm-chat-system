import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ================= HELPER ================= */

function calcHours(start?: string | null, end?: string | null) {
  if (!start || !end) return 0;

  const [h1, m1] = start.split(":").map(Number);
  const [h2, m2] = end.split(":").map(Number);

  if (
    Number.isNaN(h1) ||
    Number.isNaN(m1) ||
    Number.isNaN(h2) ||
    Number.isNaN(m2)
  ) {
    return 0;
  }

  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

/* ================= API ================= */

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

    const { data: userInfo } = await supabase
      .from("system_user")
      .select("user_type")
      .eq("system_user_id", user.id)
      .maybeSingle();

    const userType = userInfo?.user_type;

    /* ================= BODY ================= */

    const body = await req.json();
    const { work_date, items } = body;

    if (!work_date || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXISTING ================= */

    const staffIds = items.map((i: any) => i.staff_id);

    const { data: existingRows } = await supabase
      .from("system_salary_attendance")
      .select("staff_id, approved")
      .eq("tenant_id", tenant_id)
      .eq("work_date", work_date)
      .in("staff_id", staffIds);

    const approvedMap = new Map(
      (existingRows || []).map((r) => [r.staff_id, r.approved])
    );

    /* ================= BUILD DATA ================= */

   /* ================= BUILD DATA ================= */

/* ================= BUILD DATA ================= */

const rows = items.map((item: any) => {
  const {
    staff_id,
    morning_check_in,
    morning_check_out,
    afternoon_check_in,
    afternoon_check_out,
    note,
    status,
    day_type, // 🔥 THÊM
  } = item;

  const isApproved = approvedMap.get(staff_id) === true;

  // 🔒 CHẶN SỬA NẾU ĐÃ DUYỆT
  if (
    isApproved &&
    !["tenant", "admin"].includes(userType)
  ) {
    throw new Error(
      `Nhân viên ${staff_id} đã duyệt, không được sửa`
    );
  }

  /* ===== TOTAL HOURS ===== */

  const total_hours =
    calcHours(morning_check_in, morning_check_out) +
    calcHours(afternoon_check_in, afternoon_check_out);

  /* ===== STATUS (NEW) ===== */

  let finalStatus: "working" | "absent" = "working";

  if (status === "absent") {
    finalStatus = "absent";
  } else {
    finalStatus = "working";
  }

  const isAbsent = finalStatus === "absent";

  /* ===== DAY TYPE (DEFAULT) ===== */

  const finalDayType =
    day_type ||
    (new Date(work_date).getDay() === 0
      ? "sunday"
      : "normal");

  return {
    tenant_id,
    staff_id,
    work_date,
	
	created_by: user.id,
	updated_by: user.id,

    morning_check_in: isAbsent ? null : morning_check_in || null,
    morning_check_out: isAbsent ? null : morning_check_out || null,
    afternoon_check_in: isAbsent ? null : afternoon_check_in || null,
    afternoon_check_out: isAbsent ? null : afternoon_check_out || null,

    total_hours,
    status: finalStatus,
    day_type: finalDayType, // 🔥 THÊM

    note: note || null,

    approved: isApproved ? true : false,
  };
});

    /* ================= UPSERT ================= */

    const { error } = await supabase
      .from("system_salary_attendance")
      .upsert(rows, {
        onConflict: "staff_id,work_date",
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}