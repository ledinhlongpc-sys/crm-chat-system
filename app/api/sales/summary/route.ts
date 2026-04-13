import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    /* ================= RANGE ================= */
    const { searchParams } = new URL(req.url);

    let range = Number(searchParams.get("range") || 90);

    // 🔒 bảo vệ input (tránh user truyền bậy)
    if (![30, 90, 180].includes(range)) {
      range = 90;
    }

    /* ================= RPC ================= */
    const { data, error } = await supabase.rpc(
      "get_orders_summary",
      {
        tenant_input: tenant_id,
        range_input: range,
      }
    );

    if (error) {
      console.log("RPC ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      range,
      data,
    });

  } catch (err: any) {
    console.log("SERVER ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}