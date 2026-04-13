import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/finance/capital/create
====================================================== */

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

    const shareholder_id = body?.shareholder_id;
    const account_id = body?.account_id;
    const amount = Number(body?.amount || 0);
    const transaction_type =
      body?.transaction_type || "contribute";
    const note = body?.note ?? null;

    const transaction_date = body?.transaction_date
      ? new Date(body.transaction_date).toISOString()
      : new Date().toISOString();

    /* ================= VALIDATE ================= */

    if (!shareholder_id) {
      return NextResponse.json(
        { error: "Thiếu cổ đông" },
        { status: 400 }
      );
    }

    if (!account_id) {
      return NextResponse.json(
        { error: "Thiếu tài khoản tiền" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Số tiền phải > 0" },
        { status: 400 }
      );
    }

    if (!["contribute", "withdraw"].includes(transaction_type)) {
      return NextResponse.json(
        { error: "Loại giao dịch không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= LOAD SHAREHOLDER ================= */

    const { data: shareholder, error: shError } =
      await supabase
        .from("system_company_shareholders")
        .select(`id, capital_contributed`)
        .eq("id", shareholder_id)
        .eq("tenant_id", tenant_id)
        .single();

    if (shError || !shareholder) {
      return NextResponse.json(
        { error: "Cổ đông không tồn tại" },
        { status: 404 }
      );
    }

    /* ================= LOAD ACCOUNT ================= */

    const { data: account, error: accError } =
      await supabase
        .from("system_financial_accounts")
        .select(`id, current_balance, is_active`)
        .eq("id", account_id)
        .eq("tenant_id", tenant_id)
        .single();

    if (accError || !account) {
      return NextResponse.json(
        { error: "Tài khoản không tồn tại" },
        { status: 404 }
      );
    }

    if (!account.is_active) {
      return NextResponse.json(
        { error: "Tài khoản bị khóa" },
        { status: 400 }
      );
    }

    /* ================= CHECK LOGIC ================= */

    const currentCapital =
      shareholder.capital_contributed || 0;

    const currentBalance =
      account.current_balance || 0;

    if (transaction_type === "withdraw") {
      if (currentCapital < amount) {
        return NextResponse.json(
          { error: "Không thể rút vượt số đã góp" },
          { status: 400 }
        );
      }

      if (currentBalance < amount) {
        return NextResponse.json(
          { error: "Số dư tài khoản không đủ" },
          { status: 400 }
        );
      }
    }

    /* ================= INSERT CAPITAL ================= */

    const { data: insertedCapital, error: capitalError } =
      await supabase
        .from("system_capital_transactions")
        .insert({
          tenant_id,
          shareholder_id,
          account_id,
          amount,
          transaction_type,
          transaction_date,
          note,
          created_by,
        })
        .select("id")
        .single();

    if (capitalError) {
      return NextResponse.json(
        { error: capitalError.message },
        { status: 500 }
      );
    }

    /* ================= INSERT MONEY ================= */

    const { error: moneyError } = await supabase
      .from("system_money_transactions")
      .insert({
        tenant_id,
        account_id,
        amount,
        direction:
          transaction_type === "contribute" ? "in" : "out",
        transaction_type: "capital",
        transaction_date,
        description:
          note || "Giao dịch góp vốn",
        reference_type: "capital",
        reference_id: insertedCapital.id,
        created_by,
      });

    if (moneyError) {
      return NextResponse.json(
        { error: moneyError.message },
        { status: 500 }
      );
    }

    /* ================= DONE ================= */

    return NextResponse.json(
      { success: true },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}