import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const { id } = await params;
    const body = await req.json();

    const account_name = body.account_name?.trim();

    if (!account_name) {
      return NextResponse.json(
        { error: "Tên tài khoản bắt buộc" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXIST ================= */

    const { data: account } = await supabase
      .from("system_financial_accounts")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .single();

    if (!account) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản" },
        { status: 404 }
      );
    }

    /* ================= UPDATE ================= */

    const { data, error } = await supabase
      .from("system_financial_accounts")
      .update({
        account_name,
        account_type: body.account_type,
        bank_name: body.bank_name,
        bank_code: body.bank_code,
        account_number: body.account_number,
        account_holder: body.account_holder,
        is_default: body.is_default,
        is_active: body.is_active,
        note: body.note,
        branch_id: body.branch_id,
      })
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thành công",
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}