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
        { error: "Không có quyền tạo" },
        { status: 403 }
      );
    }

    /* ================= BODY ================= */
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Thiếu tên phụ cấp" },
        { status: 400 }
      );
    }

    /* ================= INSERT ================= */
    const { data, error } = await supabase
      .from("system_salary_item_types")
      .insert([
        {
          tenant_id,
          name,
          type: "allowance", // 🔥 cố định
          is_active: true,
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
      { error: err.message },
      { status: 500 }
    );
  }
}