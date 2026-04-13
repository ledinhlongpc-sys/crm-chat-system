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

    /* ================= BODY ================= */

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID_REQUIRED" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXIST ================= */

    const { data: existed } = await supabase
      .from("system_salary_config_items")
      .select("id")
      .eq("tenant_id", tenant_id)
      .eq("id", id)
      .maybeSingle();

    if (!existed) {
      return NextResponse.json(
        { error: "PHU_CAP_KHONG_TON_TAI" },
        { status: 400 }
      );
    }

    /* ================= DELETE ================= */

    const { error } = await supabase
      .from("system_salary_config_items")
      .delete()
      .eq("tenant_id", tenant_id)
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}