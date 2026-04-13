import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   DELETE /api/finance/shareholders/[id]/delete
====================================================== */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= PARAM ================= */
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID cổ đông" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXIST ================= */
    const { data: existing } = await supabase
      .from("system_company_shareholders")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Cổ đông không tồn tại" },
        { status: 404 }
      );
    }

    /* ================= CHECK CAPITAL ================= */
    const { data: capital } = await supabase
      .from("system_capital_transactions")
      .select("id")
      .eq("shareholder_id", id)
      .limit(1);

    if (capital && capital.length > 0) {
      return NextResponse.json(
        {
          error:
            "Không thể xóa cổ đông đã có giao dịch góp vốn",
        },
        { status: 400 }
      );
    }

    /* ================= DELETE ================= */
    const { error } = await supabase
      .from("system_company_shareholders")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

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