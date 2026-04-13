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

    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Thiếu danh sách ID" },
        { status: 400 }
      );
    }

    /* ================= CHECK KHÔNG XOÁ ĐÃ DUYỆT ================= */

    const { data: items } = await supabase
      .from("system_salary_penalties")
      .select("id, status")
      .in("id", ids)
      .eq("tenant_id", tenant_id);

    const hasConfirmed = items?.some((i) => i.status === "confirmed");

    if (hasConfirmed) {
      return NextResponse.json(
        { error: "Không thể xoá phiếu đã duyệt" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("system_salary_penalties")
      .delete()
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