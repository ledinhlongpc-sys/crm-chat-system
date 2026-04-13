import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const body = await req.json();

    const account_name = body.account_name?.trim();
    const account_type = body.account_type;
    const opening_balance = Number(body.opening_balance || 0);

    const is_default = !!body.is_default;
    const is_active =
      body.is_active !== undefined ? body.is_active : true;

    /* ================= VALIDATE ================= */

    if (!account_name) {
      return NextResponse.json(
        { error: "Tên tài khoản bắt buộc" },
        { status: 400 }
      );
    }

    if (!["cash", "bank", "ewallet"].includes(account_type)) {
      return NextResponse.json(
        { error: "Loại tài khoản không hợp lệ" },
        { status: 400 }
      );
    }

    if (account_type === "bank" && !body.account_number) {
      return NextResponse.json(
        { error: "Tài khoản ngân hàng phải có số tài khoản" },
        { status: 400 }
      );
    }

    /* ================= DEFAULT LOGIC ================= */

    if (is_default) {
      await supabase
        .from("system_financial_accounts")
        .update({ is_default: false })
        .eq("tenant_id", tenant_id);
    }

    /* ================= INSERT ================= */

    const { data, error } = await supabase
      .from("system_financial_accounts")
      .insert({
        tenant_id,
        branch_id: body.branch_id || null,

        account_name,
        account_type,

        bank_name: body.bank_name,
        bank_code: body.bank_code,
        account_number: body.account_number,
        account_holder: body.account_holder,

        opening_balance,
        current_balance: opening_balance,

        is_default,
        is_active,

        note: body.note,
      })
      .select("id, account_name")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}