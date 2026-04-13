// app/api/shipper/connect

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: Request) {

  try {

    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      throw new Error("TENANT_NOT_FOUND");
    }

    const body = await req.json();

    const carrier_code = body?.carrier || null;
    const api_key = body?.apiKey?.trim() || null;

    if (!carrier_code) {
      return NextResponse.json(
        { error: "Thiếu carrier_code" },
        { status: 400 }
      );
    }

    let shops: any[] = [];

    /* =====================================================
       GHN CONNECT
    ===================================================== */

    if (carrier_code === "ghn") {

      if (!api_key) {
        return NextResponse.json(
          { error: "Thiếu Token API GHN" },
          { status: 400 }
        );
      }

      const ghnRes = await fetch(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shop/all",
        {
          method: "POST",
          headers: {
            Token: api_key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            offset: 0,
            limit: 50,
          }),
        }
      );

      const ghnJson = await ghnRes.json().catch(() => null);

      console.log("GHN status:", ghnRes.status);
      console.log("GHN response:", ghnJson);

      if (!ghnRes.ok || !ghnJson || ghnJson.code !== 200) {
        return NextResponse.json(
          {
            error:
              ghnJson?.message ||
              "Token GHN không hợp lệ hoặc GHN từ chối kết nối",
          },
          { status: 400 }
        );
      }

      shops = Array.isArray(ghnJson?.data?.shops)
        ? ghnJson.data.shops
        : [];

      if (!shops.length) {
        return NextResponse.json(
          { error: "GHN không trả về shop nào" },
          { status: 400 }
        );
      }

      console.log("GHN shops:", shops);

    }

    /* =====================================================
       SAVE API KEY → system_carriers
    ===================================================== */

    const { error: carrierSaveErr } = await supabase
      .from("system_carriers")
      .update({
        api_key,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", tenant_id)
      .eq("code", carrier_code);

    if (carrierSaveErr) {
      return NextResponse.json(
        { error: carrierSaveErr.message },
        { status: 500 }
      );
    }

    /* =====================================================
       SAVE SHOPS
    ===================================================== */

    if (carrier_code === "ghn" && shops.length) {

      const rows = shops.map((shop: any) => ({

        tenant_id,

        carrier_code,

        shop_id: shop._id,

        shop_name: shop.name ?? null,

        phone: shop.phone ?? null,

        address: shop.address ?? null,

        ward_code: shop.ward_code ?? null,

        district_id: shop.district_id ?? null,

        address_v2: shop.address_v2 ?? null,

        ward_id_v2: shop.ward_id_v2 ?? null,

        province_id_v2: shop.province_id_v2 ?? null,

        client_id: shop.client_id ?? null,

        status: shop.status ?? null,

        ghn_raw: shop,

        updated_at: new Date().toISOString(),

      }));

      const { error: shopErr } = await supabase
        .from("system_carrier_shops")
        .upsert(rows, {
          onConflict: "tenant_id,carrier_code,shop_id",
        });

      if (shopErr) {
        console.error("SHOP UPSERT ERROR:", shopErr);

        return NextResponse.json(
          { error: shopErr.message },
          { status: 500 }
        );
      }

    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        carrier_code,
        shop_count: shops.length,
      },
      { status: 200 }
    );

  } catch (err: any) {

    console.error("CONNECT ERROR:", err);

    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );

  }

}