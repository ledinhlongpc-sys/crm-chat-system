import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function DELETE(
  req: Request,
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

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    const { id } = await params;

    /* ================= LOAD TRANSACTION ================= */
    const { data: tx, error: txErr } = await supabase
      .from("system_money_transactions")
      .select("id, account_id, amount, direction")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .single();

    if (txErr || !tx) {
      return NextResponse.json(
        { error: "Giao dịch không tồn tại" },
        { status: 404 }
      );
    }

    /* ================= LOAD ACCOUNT ================= */
    const { data: account } = await supabase
      .from("system_financial_accounts")
      .select("id, current_balance")
      .eq("id", tx.account_id)
      .single();

    let newBalance = Number(account?.current_balance || 0);

    /* ================= ROLLBACK ================= */
    if (tx.direction === "in") {
      newBalance -= Number(tx.amount);
    } else {
      newBalance += Number(tx.amount);
    }

    if (newBalance < 0) {
      return NextResponse.json(
        { error: "Không thể xoá vì sẽ âm số dư" },
        { status: 400 }
      );
    }

    /* ================= UPDATE BALANCE ================= */
    await supabase
      .from("system_financial_accounts")
      .update({ current_balance: newBalance })
      .eq("id", tx.account_id);

    /* ================= DELETE ================= */
    await supabase
      .from("system_money_transactions")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenant_id);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}