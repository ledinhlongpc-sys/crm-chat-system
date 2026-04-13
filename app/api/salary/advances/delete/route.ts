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
      .eq("tenant_id", tenant_id)
      .single();

    if (!["tenant", "admin", "manager"].includes(userInfo?.user_type)) {
      return NextResponse.json(
        { error: "Không có quyền xóa" },
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

    // hỗ trợ 1 id hoặc nhiều id
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "Danh sách rỗng" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXIST ================= */

    const { data: records } = await supabase
      .from("system_salary_advances")
      .select("id, status")
      .in("id", ids)
      .eq("tenant_id", tenant_id);

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy dữ liệu" },
        { status: 404 }
      );
    }
	// 🔥 CHẶN XÓA RECORD ĐÃ DUYỆT
const locked = records.filter(
  (r) => r.status === "confirmed"
);

if (locked.length > 0) {
  return NextResponse.json(
    {
      error: `Có ${locked.length} tạm ứng đã duyệt. Vui lòng bỏ chọn trước khi xóa.`,
    },
    { status: 400 }
  );
}

    const validIds = records.map((r) => r.id);

    /* ================= DELETE ================= */

    const { error } = await supabase
      .from("system_salary_advances")
      .delete()
      .in("id", validIds)
      .eq("tenant_id", tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: validIds.length,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}