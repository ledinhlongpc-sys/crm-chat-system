import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

function nextCode(prefix: string, lastCode: string | null, pad = 4) {
  const n = lastCode?.startsWith(prefix) ? Number(lastCode.slice(prefix.length)) : NaN;
  const next = Number.isFinite(n) ? n + 1 : 1;
  return `${prefix}${String(next).padStart(pad, "0")}`;
}

async function ensureRetailGroupCG0000(supabase: any, tenant_id: string): Promise<string> {
  // ✅ luôn ưu tiên tìm theo group_code = CG0000
  const { data: g0, error: g0Err } = await supabase
    .from("system_customer_groups")
    .select("id, is_default")
    .eq("tenant_id", tenant_id)
    .eq("group_code", "CG0000")
    .maybeSingle();

  if (g0Err) {
    throw new Error(g0Err.message || "Không đọc được nhóm khách hàng");
  }

  if (g0?.id) {
    // đảm bảo default
    if (!g0.is_default) {
      await supabase
        .from("system_customer_groups")
        .update({ is_default: false })
        .eq("tenant_id", tenant_id)
        .eq("is_default", true);

      await supabase
        .from("system_customer_groups")
        .update({ is_default: true })
        .eq("tenant_id", tenant_id)
        .eq("id", g0.id);
    }
    return g0.id;
  }

  // chưa có => tạo mới và set default
  await supabase
    .from("system_customer_groups")
    .update({ is_default: false })
    .eq("tenant_id", tenant_id)
    .eq("is_default", true);

  const { data: created, error: createErr } = await supabase
    .from("system_customer_groups")
    .insert({
      tenant_id,
      group_code: "CG0000",
      group_name: "Khách Lẻ",
      is_default: true,
      note: null,
    })
    .select("id")
    .single();

  if (createErr || !created?.id) {
    throw new Error(createErr?.message || "Tạo nhóm Khách Lẻ (CG0000) thất bại");
  }

  return created.id;
}

async function generateCustomerCode(supabase: any, tenant_id: string): Promise<string> {
  const { data, error } = await supabase
    .from("system_customers")
    .select("customer_code")
    .eq("tenant_id", tenant_id)
    .not("customer_code", "is", null)
    .order("customer_code", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message || "Không lấy được customer_code");

  const lastCode = data?.[0]?.customer_code ?? null;
  return nextCode("KH", lastCode, 4);
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const body = await req.json();

    const rawName = (body?.name ?? "").trim();
    const rawPhone = (body?.phone ?? "").trim();

    if (!rawName && !rawPhone) {
      return NextResponse.json(
        { error: "Cần nhập ít nhất tên hoặc số điện thoại" },
        { status: 400 }
      );
    }

    const name = rawName || (rawPhone ? "Khách Lẻ" : null);
    const phone = rawPhone || null;
    const email = (body?.email ?? "").trim() || null;

    const owner_id = body?.owner_id || null;
    const customer_group_id = body?.customer_group_id || null;
    const address = body?.address || null;

    if (!owner_id) {
      return NextResponse.json(
        { error: "Thiếu nhân viên phụ trách" },
        { status: 400 }
      );
    }

    // ✅ group: nếu không chọn -> gán CG0000
    const group_id = customer_group_id
      ? customer_group_id
      : await ensureRetailGroupCG0000(supabase, tenant_id);

    // ✅ customer_code
    const customer_code = await generateCustomerCode(supabase, tenant_id);

    const { data: customer, error: customerErr } = await supabase
      .from("system_customers")
      .insert({
        tenant_id,
        customer_code,
        name,
        phone,
        email,
        group_id,
        assigned_staff_id: owner_id,
        status: "active",
        note: null,
      })
      .select("id, customer_code, name, phone, email")
      .single();

   if (customerErr) {

  if (customerErr.code === "23505") {
    return NextResponse.json(
      { message: "Số điện thoại đã tồn tại trong hệ thống" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: customerErr.message || "Tạo khách hàng thất bại" },
    { status: 500 }
  );

}

if (!customer) {
  return NextResponse.json(
    { message: "Tạo khách hàng thất bại" },
    { status: 500 }
  );
}

    /* ================= OPTIONAL: CREATE ADDRESS ================= */
    let default_address: any = null;
    const addressLine = (address?.address_line ?? "").trim();

    if (address && addressLine) {
      const version = address.version === "v2" ? "v2" : "v1";

      // ✅ nếu user không nhập receiver -> lấy từ customer
      const receiver_name = (address?.receiver_name ?? "").trim() || customer.name || null;
      const receiver_phone = (address?.receiver_phone ?? "").trim() || customer.phone || null;

      const addressPayload = {
        tenant_id,
        customer_id: customer.id,
        is_default: true,
        address_line: addressLine,

        province_code_v1: version === "v1" ? address.province_code || null : null,
        district_code_v1: version === "v1" ? address.district_code || null : null,
        ward_code_v1: version === "v1" ? address.ward_code || null : null,

        province_code_v2: version === "v2" ? address.province_code || null : null,
        commune_code_v2: version === "v2" ? address.commune_code || null : null,

        province_name_v1: version === "v1" ? address.province_name_v1 || null : null,
        district_name_v1: version === "v1" ? address.district_name_v1 || null : null,
        ward_name_v1: version === "v1" ? address.ward_name_v1 || null : null,

        province_name_v2: version === "v2" ? address.province_name_v2 || null : null,
        commune_name_v2: version === "v2" ? address.commune_name_v2 || null : null,

        receiver_name,
        receiver_phone,
      };

      const { data: addrRow, error: addrErr } = await supabase
        .from("system_customer_addresses")
        .insert(addressPayload)
        .select(
          "id, address_line, province_name_v1, district_name_v1, ward_name_v1, province_name_v2, commune_name_v2, receiver_name, receiver_phone"
        )
        .single();

      if (addrErr) {
        return NextResponse.json(
          { error: addrErr?.message || "Tạo địa chỉ khách hàng thất bại" },
          { status: 500 }
        );
      }

      default_address = addrRow
        ? {
            id: addrRow.id,
            address_line: addrRow.address_line,
            province_name: addrRow.province_name_v1 ?? addrRow.province_name_v2 ?? null,
            district_name: addrRow.district_name_v1 ?? null,
            ward_name: addrRow.ward_name_v1 ?? null,
            commune_name: addrRow.commune_name_v2 ?? null,
            receiver_name: addrRow.receiver_name ?? null,
            receiver_phone: addrRow.receiver_phone ?? null,
          }
        : null;
    }

    return NextResponse.json(
      {
        id: customer.id,
        customer_code: customer.customer_code,
        name: customer.name ?? null,
        phone: customer.phone ?? null,
        email: customer.email ?? null,
        default_address,
      },
      { status: 200 }
    );
  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json({ error: "Chưa khởi tạo cửa hàng" }, { status: 400 });
    }
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}