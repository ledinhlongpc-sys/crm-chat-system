import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   GET /api/finance/shareholders/[id]
====================================================== */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ FIX
) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= PARAM ================= */
    const { id } = await params; // ✅ FIX CHÍNH

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID cổ đông" },
        { status: 400 }
      );
    }

    /* ================= QUERY ================= */
    const { data, error } = await supabase
      .from("system_company_shareholders")
      .select(`
        id,
        shareholder_name,
        phone,
        email,
        capital_commitment,
        capital_contributed,
        ownership_percent,
        status,
        note,
        created_at,
		branch_id
      `)
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Không tìm thấy cổ đông" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });

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