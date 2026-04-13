import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

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

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    // 🔥 FIX Ở ĐÂY
    const { id } = await context.params;

    const body = await req.json();

    const {
      full_name,
      phone,
      birth_date,
      join_date,
      id_number,
      address,
      branch_id,
      position_id,
      status,
    } = body;

    const { data: currentUser } = await supabase
      .from("system_user")
      .select("user_type")
      .eq("system_user_id", user.id)
      .maybeSingle();

    const allowEditJoinDate = ["tenant", "admin", "manager"].includes(
      currentUser?.user_type
    );

    const updateData: any = {
      full_name,
      phone,
      birth_date,
      id_number,
      address,
      branch_id,
      position_id,
      status,
      updated_at: new Date().toISOString(),
    };

    if (allowEditJoinDate) {
      updateData.join_date = join_date;
    }

    const { data: updated, error: updateError } = await supabase
      .from("system_salary_staffs")
      .update(updateData)
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}