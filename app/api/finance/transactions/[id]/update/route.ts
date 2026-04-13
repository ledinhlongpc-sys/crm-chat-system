import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function PUT(
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

    const tenant_id = await getTenantId(supabase);
    const { id } = await params;

    const body = await req.json();

    const {
      account_id,
      direction,
      amount,
      description,
      category_id,
      transaction_date,
      proof_images = [],
    } = body;

    /* ================= VALIDATE ================= */

    if (!account_id) {
      return NextResponse.json(
        { error: "Thiếu tài khoản" },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    if (!["in", "out"].includes(direction)) {
      return NextResponse.json(
        { error: "Direction không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= LOAD OLD ================= */

    const { data: oldTx } = await supabase
      .from("system_money_transactions")
      .select("account_id, amount, direction")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .single();

    if (!oldTx) {
      return NextResponse.json(
        { error: "Giao dịch không tồn tại" },
        { status: 404 }
      );
    }

    /* ================= LOAD ACCOUNT ================= */

    const { data: account } = await supabase
      .from("system_financial_accounts")
      .select("id, current_balance")
      .eq("id", account_id)
      .single();

    let balance = Number(account?.current_balance || 0);

    /* ================= ROLLBACK OLD ================= */

    if (oldTx.direction === "in") {
      balance -= Number(oldTx.amount);
    } else {
      balance += Number(oldTx.amount);
    }

    /* ================= APPLY NEW ================= */

    if (direction === "in") {
      balance += Number(amount);
    } else {
      if (balance < Number(amount)) {
        return NextResponse.json(
          { error: "Số dư không đủ" },
          { status: 400 }
        );
      }
      balance -= Number(amount);
    }

    /* ================= UPDATE ACCOUNT ================= */

    await supabase
      .from("system_financial_accounts")
      .update({ current_balance: balance })
      .eq("id", account_id);

    /* ================= UPDATE TRANSACTION ================= */

    const { error } = await supabase
      .from("system_money_transactions")
      .update({
        account_id,
        direction,
        transaction_type:
          direction === "in" ? "income" : "expense",
        amount: Number(amount),
        description: description || null,
        category_id: category_id || null,
        transaction_date:
          transaction_date || new Date().toISOString(),
        proof_images,
      })
      .eq("id", id)
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