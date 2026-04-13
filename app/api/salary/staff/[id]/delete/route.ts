import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    /* ================= ROLE ================= */

    const { data: currentUser } = await supabase
      .from("system_user")
      .select("user_type")
      .eq("system_user_id", user.id)
      .maybeSingle();

    const userType = currentUser?.user_type;

    const allowDelete = ["tenant", "admin"].includes(userType); // 🔥 FIX: bỏ manager

    if (!allowDelete) {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa nhân viên" },
        { status: 403 }
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

    /* ================= PARAMS ================= */

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu id" },
        { status: 400 }
      );
    }

    /* ================= CHECK STAFF ================= */

    const { data: staff } = await supabase
      .from("system_salary_staffs")
      .select("id, status")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (!staff) {
      return NextResponse.json(
        { error: "Nhân viên không tồn tại" },
        { status: 404 }
      );
    }

    /* ================= CHECK PAYROLL ================= */

    const { data: payroll } = await supabase
      .from("system_salary_payrolls")
      .select("id")
      .eq("staff_id", id)
      .limit(1);

    const hasPayroll = payroll && payroll.length > 0;

    /* ================= HANDLE ================= */

    if (hasPayroll) {
      // ❌ KHÔNG XÓA → chỉ set nghỉ
      const { error: updateError } = await supabase
        .from("system_salary_staffs")
        .update({ status: "inactive" })
        .eq("id", id)
        .eq("tenant_id", tenant_id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Nhân viên đã có dữ liệu lương → chuyển trạng thái nghỉ",
        type: "inactivated",
      });
    }

    /* ================= HARD DELETE ================= */

    const { error: deleteError } = await supabase
      .from("system_salary_staffs")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenant_id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa nhân viên",
      type: "deleted",
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}