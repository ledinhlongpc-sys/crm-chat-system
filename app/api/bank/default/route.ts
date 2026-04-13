import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function GET(req: NextRequest) {

  const supabase = await createServerSupabaseClient();
  const tenant_id = await getTenantId(supabase);

  if (!tenant_id) {
    return NextResponse.json(
      { error: "TENANT_NOT_FOUND" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const branch_id = searchParams.get("branch_id");

  /* =========================
     1️⃣ TÌM NGÂN HÀNG THEO CHI NHÁNH
  ========================== */

  if (branch_id) {

    const { data } = await supabase
      .from("system_bank_accounts")
      .select(`
        bank_code,
        bank_name,
        account_number,
        account_name
      `)
      .eq("tenant_id", tenant_id)
      .eq("branch_id", branch_id)
      .eq("is_default", true)
      .single();

    if (data) {
      return NextResponse.json(data);
    }

  }

  /* =========================
     2️⃣ FALLBACK NGÂN HÀNG CHUNG
  ========================== */

  const { data, error } = await supabase
    .from("system_bank_accounts")
    .select(`
      bank_code,
      bank_name,
      account_number,
      account_name
    `)
    .eq("tenant_id", tenant_id)
    .is("branch_id", null)
    .eq("is_default", true)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "BANK_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}