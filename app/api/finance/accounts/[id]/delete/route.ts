import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const { id } = await params; // ✅ FIX

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu id" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXIST ================= */

    const { data: account, error: fetchError } =
      await supabase
        .from("system_financial_accounts")
        .select("id, is_default")
        .eq("id", id)
        .eq("tenant_id", tenant_id)
        .single();

    if (fetchError || !account) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản" },
        { status: 404 }
      );
    }

    /* ================= BLOCK DEFAULT ================= */

    if (account.is_default) {
      return NextResponse.json(
        { error: "Không thể xoá tài khoản mặc định" },
        { status: 400 }
      );
    }

    /* ================= CHECK TRANSACTIONS ================= */

    const { count } = await supabase
      .from("system_money_transactions")
      .select("id", { count: "exact", head: true })
      .eq("account_id", id);

    if ((count || 0) > 0) {
      return NextResponse.json(
        {
          error:
            "Tài khoản đã phát sinh giao dịch, không thể xoá",
        },
        { status: 400 }
      );
    }

    /* ================= DELETE ================= */

    const { error } = await supabase
      .from("system_financial_accounts")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xoá tài khoản thành công",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}