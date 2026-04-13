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
    const { name } = body;

    /* ================= VALIDATE ================= */

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên chức vụ" },
        { status: 400 }
      );
    }

    const cleanName = name.trim();

    /* ================= CHECK DUPLICATE ================= */

    const { data: existing } = await supabase
      .from("system_salary_positions")
      .select("id")
      .eq("tenant_id", tenant_id)
      .ilike("name", cleanName)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Chức vụ đã tồn tại" },
        { status: 400 }
      );
    }

    /* ================= GENERATE CODE ================= */

    const code = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_");

    /* ================= INSERT ================= */

    const { data: inserted, error: insertError } = await supabase
      .from("system_salary_positions")
      .insert({
        tenant_id,
        name: cleanName,
        code,
        is_active: true,
      })
      .select("id, name, code")
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
      data: inserted,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}