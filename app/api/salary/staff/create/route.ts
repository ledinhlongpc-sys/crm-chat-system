import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: NextRequest) {
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

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      full_name,
      phone,
	  birth_date,
	   join_date,
	  id_number, 
	  address,
      position_id,
      branch_id,
      status,
	  
	  
    } = body;

    /* ================= VALIDATE ================= */

    if (!full_name || !full_name.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên nhân viên" },
        { status: 400 }
      );
    }

    /* ================= VALIDATE POSITION ================= */

    if (position_id) {
      const { data: position, error: positionError } = await supabase
        .from("system_salary_positions")
        .select("id")
        .eq("tenant_id", tenant_id)
        .eq("id", position_id)
        .maybeSingle();

      if (positionError || !position) {
        return NextResponse.json(
          { error: "CHUC_VU_KHONG_TON_TAI" },
          { status: 400 }
        );
      }
    }

    /* ================= VALIDATE BRANCH ================= */

    if (branch_id) {
      const { data: branch, error: branchError } = await supabase
        .from("system_branches")
        .select("id")
        .eq("tenant_id", tenant_id)
        .eq("id", branch_id)
        .maybeSingle();

      if (branchError || !branch) {
        return NextResponse.json(
          { error: "CHI_NHANH_KHONG_TON_TAI" },
          { status: 400 }
        );
      }
    }

    /* ================= INSERT ================= */

    const { data: inserted, error: insertError } = await supabase
      .from("system_salary_staffs")
      .insert({
  tenant_id,
  full_name: full_name.trim(),
  phone: phone?.trim() || null,
  birth_date: birth_date || null,
  join_date: join_date || null,
  id_number: id_number?.trim() || null,
  address: address?.trim() || null,
  position_id: position_id || null,
  branch_id: branch_id || null,
  status: status || "active",
})
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,
      id: inserted.id,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}