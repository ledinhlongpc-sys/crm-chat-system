import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const tenant_id = await getTenantId(supabase);

    const { data: userInfo } = await supabase
      .from("system_user")
      .select("user_type")
      .eq("system_user_id", user.id)
      .eq("tenant_id", tenant_id)
      .single();

    if (!["tenant", "admin", "manager"].includes(userInfo?.user_type)) {
      return NextResponse.json(
        { error: "Không có quyền duyệt" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { ids } = body;

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: "Thiếu danh sách ID" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("system_salary_penalties")
      .update({
        status: "confirmed",
      })
      .in("id", ids)
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