import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: Request) {
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

    const created_by = user.id;

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    const body = await req.json();

    const {
      account_id,
      direction,
      amount,
      description,
      category_id,
      transaction_date,
      reference_type = "manual", // ✅ default
      reference_id = null,
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

    /* ================= CHECK ACCOUNT ================= */

    const { data: account, error: accErr } = await supabase
      .from("system_financial_accounts")
      .select("id, current_balance")
      .eq("id", account_id)
      .eq("tenant_id", tenant_id)
      .single();

    if (accErr || !account) {
      return NextResponse.json(
        { error: "Tài khoản không tồn tại" },
        { status: 400 }
      );
    }

    /* ================= 🚨 CHẶN ÂM TIỀN ================= */

    if (
      direction === "out" &&
      Number(amount) > Number(account.current_balance)
    ) {
      return NextResponse.json(
        { error: "Số dư không đủ để thực hiện giao dịch" },
        { status: 400 }
      );
    }

    /* ================= INSERT ================= */

    const { error: insertError } = await supabase
      .from("system_money_transactions")
      .insert({
        tenant_id,
        account_id,
        direction,
        transaction_type:
          direction === "in" ? "income" : "expense",
        amount: Number(amount),
        description: description || null,
        category_id: category_id || null,
        transaction_date:
          transaction_date || new Date().toISOString(),
        created_by,
        reference_type,
        reference_id,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    /* ================= DONE ================= */

    return NextResponse.json(
      { success: true },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}