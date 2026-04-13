import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    /* ===== BODY ===== */
    const { ids, supplier_group_id } = await req.json();

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      !supplier_group_id
    ) {
      return NextResponse.json(
        { error: "Payload không hợp lệ" },
        { status: 400 }
      );
    }

    /* ===== UPDATE ===== */
    const { error } = await supabase
      .from("system_supplier")
      .update({
        supplier_group_id,
        updated_at: new Date().toISOString(),
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
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
