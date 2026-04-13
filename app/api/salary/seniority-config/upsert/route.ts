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

    /* ================= USER TYPE ================= */

    const { data: currentUser } = await supabase
      .from("system_user")
      .select("system_user_id, user_type")
      .eq("system_user_id", user.id)
      .maybeSingle();

    const userType = currentUser?.user_type;

    if (!["tenant", "admin", "manager"].includes(userType)) {
      return NextResponse.json(
        { error: "KHONG_CO_QUYEN" },
        { status: 403 }
      );
    }

    /* ================= BODY ================= */

    const body = await req.json();

    const {
      is_enabled,
      months_step,
      amount_per_step,
      max_steps,
    } = body;

    /* ================= VALIDATE ================= */

    if (is_enabled) {
      if (!months_step || Number(months_step) <= 0) {
        return NextResponse.json(
          { error: "MONTHS_STEP_INVALID" },
          { status: 400 }
        );
      }

      if (!amount_per_step || Number(amount_per_step) <= 0) {
        return NextResponse.json(
          { error: "AMOUNT_INVALID" },
          { status: 400 }
        );
      }
    }

    /* ================= CHECK EXIST ================= */

    const { data: existed } = await supabase
      .from("system_salary_seniority_configs")
      .select("id")
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    /* ================= UPDATE ================= */

    if (existed) {
      const { error: updateError } = await supabase
        .from("system_salary_seniority_configs")
        .update({
          is_enabled: !!is_enabled,
          months_step: Number(months_step),
          amount_per_step: Number(amount_per_step),
          max_steps: max_steps ? Number(max_steps) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existed.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        mode: "update",
      });
    }

    /* ================= INSERT ================= */

    const { error: insertError } = await supabase
      .from("system_salary_seniority_configs")
      .insert({
        tenant_id,
        is_enabled: !!is_enabled,
        months_step: Number(months_step),
        amount_per_step: Number(amount_per_step),
        max_steps: max_steps ? Number(max_steps) : null,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,
      mode: "insert",
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}