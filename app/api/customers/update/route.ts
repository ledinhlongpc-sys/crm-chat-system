//app/api/customers/edit

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   PUT /api/customers/update
   - Cập nhật khách hàng
   - Cập nhật / tạo địa chỉ mặc định
   - LƯU CẢ CODE + NAME (GIỐNG CREATE)
====================================================== */
export async function PUT(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    const body = await req.json();

    const id = body?.id;
    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID khách hàng" },
        { status: 400 }
      );
    }

    const name = body?.name?.trim() || null;
    const phone = body?.phone || null;
    const email = body?.email || null;
    const group_id = body?.group_id || null;
    const assigned_staff_id = body?.assigned_staff_id || null;
    const note = body?.note || null;
    const status = body?.status || "active";

    const address = body?.address || null;

    if (!name && !phone) {
      return NextResponse.json(
        { error: "Cần nhập ít nhất tên hoặc số điện thoại" },
        { status: 400 }
      );
    }

    /* ================= UPDATE CUSTOMER ================= */
    const { data: customer, error: customerErr } = await supabase
      .from("system_customers")
      .update({
        name,
        phone,
        email,
        group_id,
        assigned_staff_id,
        note,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .select("id, customer_code")
      .single();

    if (customerErr || !customer) {
      return NextResponse.json(
        {
          error:
            customerErr?.message ||
            "Cập nhật khách hàng thất bại",
        },
        { status: 500 }
      );
    }

    /* ================= UPDATE / INSERT ADDRESS ================= */
    if (address) {
      const version = address.version === "v2" ? "v2" : "v1";

      const { data: existingAddress } = await supabase
        .from("system_customer_addresses")
        .select("id")
        .eq("tenant_id", tenant_id)
        .eq("customer_id", id)
        .maybeSingle();

      const addressPayload = {
        tenant_id,
        customer_id: id,
		 address_line: address.address_line, // 👈 BẮT BUỘC
        /* ===== CODE ===== */
        province_code_v1:
          version === "v1" ? address.province_code_v1 || null : null,
        district_code_v1:
          version === "v1" ? address.district_code_v1 || null : null,
        ward_code_v1:
          version === "v1" ? address.ward_code_v1 || null : null,

        province_code_v2:
          version === "v2" ? address.province_code_v2 || null : null,
        commune_code_v2:
          version === "v2" ? address.commune_code_v2 || null : null,

        /* ===== NAME (QUAN TRỌNG) ===== */
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

      if (existingAddress?.id) {
        const { error: updateErr } = await supabase
          .from("system_customer_addresses")
          .update(addressPayload)
          .eq("id", existingAddress.id)
          .eq("tenant_id", tenant_id);

        if (updateErr) {
          return NextResponse.json(
            { error: "Cập nhật địa chỉ thất bại" },
            { status: 500 }
          );
        }
      } else {
        const { error: insertErr } = await supabase
          .from("system_customer_addresses")
          .insert(addressPayload);

        if (insertErr) {
          return NextResponse.json(
            { error: "Tạo địa chỉ khách hàng thất bại" },
            { status: 500 }
          );
        }
      }
    }

    /* ================= RESPONSE ================= */
    return NextResponse.json(customer, { status: 200 });
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
