import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   PUT /api/customers/address/update
   - Cập nhật địa chỉ giao hàng
   - Không tạo mới
   - Không thay đổi default (trừ khi anh muốn thêm sau)
====================================================== */

export async function PUT(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const body = await req.json();

    const address_id = body?.id || null;
    const customer_id = body?.customer_id || null;
    const address = body?.address || null;

    if (!address_id || !customer_id) {
      return NextResponse.json(
        { error: "Thiếu id hoặc customer_id" },
        { status: 400 }
      );
    }

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

    /* ================= CHECK ADDRESS EXIST ================= */

    const { data: existed, error: exErr } = await supabase
      .from("system_customer_addresses")
      .select("id, customer_id")
      .eq("tenant_id", tenant_id)
      .eq("id", address_id)
      .single();

    if (exErr || !existed) {
      return NextResponse.json(
        { error: "Không tìm thấy địa chỉ" },
        { status: 404 }
      );
    }

    if (existed.customer_id !== customer_id) {
      return NextResponse.json(
        { error: "Địa chỉ không thuộc khách hàng này" },
        { status: 403 }
      );
    }

    /* ================= LOAD CUSTOMER (fallback receiver) ================= */

    const { data: customer, error: cErr } = await supabase
      .from("system_customers")
      .select("id, name, phone")
      .eq("tenant_id", tenant_id)
      .eq("id", customer_id)
      .single();

    if (cErr || !customer) {
      return NextResponse.json(
        { error: "Không tìm thấy khách hàng" },
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

    /* ================= BUILD UPDATE PAYLOAD ================= */

    const payload: any = {
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
      province_name_v1:
        version === "v1" ? address.province_name_v1 || null : null,
      district_name_v1:
        version === "v1" ? address.district_name_v1 || null : null,
      ward_name_v1:
        version === "v1" ? address.ward_name_v1 || null : null,

      province_name_v2:
        version === "v2" ? address.province_name_v2 || null : null,
      commune_name_v2:
        version === "v2" ? address.commune_name_v2 || null : null,
    };

    /* ================= UPDATE ================= */

    const { data: updated, error: upErr } = await supabase
      .from("system_customer_addresses")
      .update(payload)
      .eq("tenant_id", tenant_id)
      .eq("id", address_id)
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

    if (upErr || !updated) {
      return NextResponse.json(
        { error: upErr?.message || "Cập nhật địa chỉ thất bại" },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json(
      {
        id: updated.id,
        address_line: updated.address_line,
        receiver_name: updated.receiver_name ?? null,
        receiver_phone: updated.receiver_phone ?? null,

        province_name:
          updated.province_name_v1 ??
          updated.province_name_v2 ??
          null,
        district_name: updated.district_name_v1 ?? null,
        ward_name: updated.ward_name_v1 ?? null,
        commune_name: updated.commune_name_v2 ?? null,
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