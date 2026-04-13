import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/customers/address/create
   - Thêm địa chỉ giao hàng cho khách
   - Set default: true cho địa chỉ mới
   - Tắt default của các địa chỉ khác
   - receiver_name/phone: nếu null -> fallback từ system_customers
====================================================== */

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const body = await req.json();

    const customer_id = body?.customer_id || null;
    if (!customer_id) {
      return NextResponse.json(
        { error: "Thiếu customer_id" },
        { status: 400 }
      );
    }

    const address = body?.address || null;
    if (!address) {
      return NextResponse.json(
        { error: "Thiếu thông tin địa chỉ" },
        { status: 400 }
      );
    }

    const address_line = (address?.address_line ?? "").trim();
    if (!address_line) {
      return NextResponse.json(
        { error: "Thiếu địa chỉ cụ thể (address_line)" },
        { status: 400 }
      );
    }

    const version = address?.version === "v2" ? "v2" : "v1";

    /* ================= LOAD CUSTOMER (fallback receiver) ================= */

    const { data: customer, error: cErr } = await supabase
      .from("system_customers")
      .select("id, name, phone")
      .eq("tenant_id", tenant_id)
      .eq("id", customer_id)
      .single();

    if (cErr || !customer) {
      return NextResponse.json(
        { error: cErr?.message || "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    const receiver_name =
      (body?.receiver_name ?? "").trim() ||
      (customer?.name ?? null) ||
      null;

    const receiver_phone =
      (body?.receiver_phone ?? "").trim() ||
      (customer?.phone ?? null) ||
      null;

    /* ================= TURN OFF OLD DEFAULT ================= */

    const { error: offErr } = await supabase
      .from("system_customer_addresses")
      .update({ is_default: false })
      .eq("tenant_id", tenant_id)
      .eq("customer_id", customer_id)
      .eq("is_default", true);

    if (offErr) {
      return NextResponse.json(
        { error: offErr?.message || "Không thể cập nhật default cũ" },
        { status: 500 }
      );
    }

    /* ================= INSERT NEW ADDRESS ================= */

    const payload: any = {
      tenant_id,
      customer_id,
      is_default: true,
      address_line,

      receiver_name,
      receiver_phone,

      /* ===== CODE ===== */
      province_code_v1: version === "v1" ? address.province_code || null : null,
      district_code_v1: version === "v1" ? address.district_code || null : null,
      ward_code_v1: version === "v1" ? address.ward_code || null : null,

      province_code_v2: version === "v2" ? address.province_code || null : null,
      commune_code_v2: version === "v2" ? address.commune_code || null : null,

      /* ===== NAME ===== */
      province_name_v1: version === "v1" ? address.province_name_v1 || null : null,
      district_name_v1: version === "v1" ? address.district_name_v1 || null : null,
      ward_name_v1: version === "v1" ? address.ward_name_v1 || null : null,

      province_name_v2: version === "v2" ? address.province_name_v2 || null : null,
      commune_name_v2: version === "v2" ? address.commune_name_v2 || null : null,
    };

    const { data: created, error: insErr } = await supabase
      .from("system_customer_addresses")
      .insert(payload)
      .select(
        `
        id,
        address_line,
        receiver_name,
        receiver_phone,
        province_name_v1,
        district_name_v1,
        ward_name_v1,
        province_name_v2,
        commune_name_v2
      `
      )
      .single();

    if (insErr || !created) {
      return NextResponse.json(
        { error: insErr?.message || "Thêm địa chỉ thất bại" },
        { status: 500 }
      );
    }

    /* ================= RESPONSE (FE dùng luôn) ================= */

    return NextResponse.json(
      {
        id: created.id,
        address_line: created.address_line,
        receiver_name: created.receiver_name ?? null,
        receiver_phone: created.receiver_phone ?? null,

        province_name: created.province_name_v1 ?? created.province_name_v2 ?? null,
        district_name: created.district_name_v1 ?? null,
        ward_name: created.ward_name_v1 ?? null,
        commune_name: created.commune_name_v2 ?? null,
      },
      { status: 200 }
    );
  } catch (err: any) {
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