// app/api/customers/create/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/customers/create
====================================================== */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      throw new Error("TENANT_NOT_FOUND");
    }

    /* ================= BODY ================= */
    const body = await req.json();

    const name = body?.name?.trim() || null;

    // 🔥 normalize phone (QUAN TRỌNG)
    const phone =
      body?.phone?.replace(/\D/g, "") || null;

    const email = body?.email || null;
    const group_id = body?.group_id || null;
    const assigned_staff_id = body?.assigned_staff_id || null;
    const note = body?.note || null;
    const status = body?.status || "active";

    const address = body?.address || null;

    /* ================= VALIDATION ================= */
    if (!name && !phone) {
      return NextResponse.json(
        { error: "Cần nhập ít nhất tên hoặc số điện thoại" },
        { status: 400 }
      );
    }

    /* ================= CHECK DUPLICATE PHONE ================= */
    if (phone) {
      const { data: existed } = await supabase
        .from("system_customers")
        .select("id, name")
        .eq("tenant_id", tenant_id)
        .eq("phone", phone)
        .maybeSingle();

      if (existed) {
        return NextResponse.json(
          {
            error: "Số điện thoại đã tồn tại",
            existing_customer: existed,
          },
          { status: 400 }
        );
      }
    }

    /* ================= CUSTOMER CODE ================= */
    const { data: lastCustomer } = await supabase
      .from("system_customers")
      .select("customer_code")
      .eq("tenant_id", tenant_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (lastCustomer?.customer_code) {
      const match = lastCustomer.customer_code.match(/\d+$/);
      if (match) nextNumber = Number(match[0]) + 1;
    }

    const customer_code = `KH${String(nextNumber).padStart(4, "0")}`;

    /* ================= INSERT CUSTOMER ================= */
    const { data: customer, error: customerErr } = await supabase
      .from("system_customers")
      .insert({
        tenant_id,
        customer_code,
        name,
        phone,
        email,
        group_id,
        assigned_staff_id,
        note,
        status,
      })
      .select("id, customer_code, name")
      .single();

    if (customerErr || !customer) {
      return NextResponse.json(
        { error: customerErr?.message || "Tạo khách hàng thất bại" },
        { status: 500 }
      );
    }

    /* ================= INSERT ADDRESS (OPTIONAL) ================= */
    if (address) {
      const version = address.version === "v2" ? "v2" : "v1";

      const { error: addressErr } = await supabase
        .from("system_customer_addresses")
        .insert({
          tenant_id,
          customer_id: customer.id,

          address_line:
            address?.address_line?.trim() || null,

          /* ===== CODE ===== */
          province_code_v1:
            version === "v1" ? address?.province_code_v1 || null : null,
          district_code_v1:
            version === "v1" ? address?.district_code_v1 || null : null,
          ward_code_v1:
            version === "v1" ? address?.ward_code_v1 || null : null,

          province_code_v2:
            version === "v2" ? address?.province_code_v2 || null : null,
          commune_code_v2:
            version === "v2" ? address?.commune_code_v2 || null : null,

          /* ===== NAME ===== */
          province_name_v1:
            version === "v1" ? address?.province_name_v1 || null : null,
          district_name_v1:
            version === "v1" ? address?.district_name_v1 || null : null,
          ward_name_v1:
            version === "v1" ? address?.ward_name_v1 || null : null,

          province_name_v2:
            version === "v2" ? address?.province_name_v2 || null : null,
          commune_name_v2:
            version === "v2" ? address?.commune_name_v2 || null : null,
        });

      if (addressErr) {
        return NextResponse.json(
          { error: "Tạo địa chỉ khách hàng thất bại" },
          { status: 500 }
        );
      }
    }

    /* ================= RESPONSE ================= */
    return NextResponse.json(customer, { status: 201 });

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