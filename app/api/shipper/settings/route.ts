// app/api/shipper/settings

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: Request) {
  try {

    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const body = await req.json();

    const carrier = body?.carrier;

    const payer_type = body?.payer_type || "shop";
    const pickup_type = body?.pickup_type || "warehouse";

    const insurance_enabled = body?.insurance_enabled || false;
    const partial_delivery = body?.partial_delivery || false;
    const merge_package = body?.merge_package || false;
    const cod_failed_collect = body?.cod_failed_collect || false;

    const is_default = body?.is_default || false;

    /* ================= SAVE SETTINGS ================= */

    const { error: settingsErr } = await supabase
      .from("system_carrier_settings")
      .upsert({
        tenant_id,
        carrier_code: carrier,
        payer_type,
        pickup_type,
        insurance_enabled,
        partial_delivery,
        merge_package,
        cod_failed_collect
      });

    if (settingsErr) {
      return NextResponse.json(
        { error: "Lưu settings thất bại" },
        { status: 500 }
      );
    }

    /* ================= DEFAULT CARRIER ================= */

    if (is_default) {

      await supabase
        .from("system_carriers")
        .update({ is_default: false })
        .eq("tenant_id", tenant_id);

      await supabase
        .from("system_carriers")
        .update({ is_default: true })
        .eq("tenant_id", tenant_id)
        .eq("code", carrier);

    }

    return NextResponse.json({ success: true });

  } catch (err:any) {

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );

  }
}