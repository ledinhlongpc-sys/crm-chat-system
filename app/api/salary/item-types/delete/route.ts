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

    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Thiếu danh sách ID" },
        { status: 400 }
      );
    }

    /* ================= CHECK ĐANG DÙNG ================= */

    const { data: usedItems } = await supabase
      .from("system_salary_config_items")
      .select("item_type_id")
      .in("item_type_id", ids)
      .eq("tenant_id", tenant_id);

    if (usedItems && usedItems.length > 0) {
      return NextResponse.json(
        {
          error:
            "Có phụ cấp đang được sử dụng. Vui lòng ngưng trước khi xoá.",
        },
        { status: 400 }
      );
    }

    /* ================= XOÁ CỨNG ================= */

    const { error } = await supabase
      .from("system_salary_item_types")
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