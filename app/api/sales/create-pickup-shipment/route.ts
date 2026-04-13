import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: NextRequest) {
  try {

    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { order_code } = body;

    if (!order_code) {
      return NextResponse.json(
        { error: "Thiếu order_code" },
        { status: 400 }
      );
    }

    /* ================= CALL FUNCTION ================= */

    const { data: order_id, error } = await supabase.rpc(
      "sales_order_create_pickup_shipment",
      {
        p_tenant_id: tenant_id,
        p_order_code: order_code,
      }
    );

    if (error || !order_id) {
      return NextResponse.json(
        { error: error?.message || "CREATE_PICKUP_SHIPMENT_FAILED" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order_id,
    });

  } catch (err: any) {

    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );

  }
}