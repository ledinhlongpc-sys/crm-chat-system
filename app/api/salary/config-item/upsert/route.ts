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

    const body = await req.json();

    const {
      staff_id,
      item_type_id,
      amount,
    } = body;

    /* ================= VALIDATE ================= */

    if (!staff_id) {
      return NextResponse.json(
        { error: "STAFF_ID_REQUIRED" },
        { status: 400 }
      );
    }

    if (!item_type_id) {
      return NextResponse.json(
        { error: "ITEM_TYPE_REQUIRED" },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "AMOUNT_INVALID" },
        { status: 400 }
      );
    }

    /* ================= VALIDATE STAFF ================= */

    const { data: staff } = await supabase
      .from("system_salary_staffs")
      .select("id")
      .eq("tenant_id", tenant_id)
      .eq("id", staff_id)
      .maybeSingle();

    if (!staff) {
      return NextResponse.json(
        { error: "NHAN_VIEN_KHONG_TON_TAI" },
        { status: 400 }
      );
    }

    /* ================= VALIDATE ITEM TYPE ================= */

    const { data: itemType } = await supabase
      .from("system_salary_item_types")
      .select("id")
      .eq("tenant_id", tenant_id)
      .eq("id", item_type_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!itemType) {
      return NextResponse.json(
        { error: "LOAI_PHU_CAP_KHONG_TON_TAI" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXIST ================= */

    const { data: existed } = await supabase
      .from("system_salary_config_items")
      .select("id")
      .eq("tenant_id", tenant_id)
      .eq("staff_id", staff_id)
      .eq("item_type_id", item_type_id)
      .maybeSingle();

    /* ================= UPDATE ================= */

    if (existed) {
      const { error: updateError } = await supabase
        .from("system_salary_config_items")
        .update({
          amount: Number(amount),
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
      .from("system_salary_config_items")
      .insert({
        tenant_id,
        staff_id,
        item_type_id,
        amount: Number(amount),
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