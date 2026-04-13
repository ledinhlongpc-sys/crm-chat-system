import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   GET /api/account/branch-default
   PUT /api/account/branch-default
   - Quản lý chi nhánh mặc định của TENANT
====================================================== */

/* ================= GET ================= */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    const { data, error } = await supabase
      .from("system_branches")
      .select(`
        id,
        name,
        phone,
        address,
        province_text,
        district_text,
        ward_text,
        branch_id,
        shop_logo_url
      `)
      .eq("tenant_id", tenant_id)
      .eq("is_default", true)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? null);
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    if (err.message === "TENANT_NOT_FOUND") {
      // tenant chưa khởi tạo → chưa có chi nhánh
      return NextResponse.json(null);
    }

    return NextResponse.json(
      { error: "Không tải được chi nhánh mặc định" },
      { status: 500 }
    );
  }
}

/* ================= PUT ================= */
export async function PUT(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    const body = await req.json();

    /* ===== kiểm tra chi nhánh mặc định ===== */
    const { data: existing } = await supabase
      .from("system_branches")
      .select("id")
      .eq("tenant_id", tenant_id)
      .eq("is_default", true)
      .eq("is_active", true)
      .maybeSingle();

    const payload = {
      name: body.name ?? "Chi nhánh chính",
      phone: body.phone ?? null,
      address: body.address ?? null,
      province_text: body.province_text ?? null,
      district_text: body.district_text ?? null,
      ward_text: body.ward_text ?? null,
      shop_logo_url: body.shop_logo_url ?? null,
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      /* ===== UPDATE ===== */
      const { error } = await supabase
        .from("system_branches")
        .update(payload)
        .eq("id", existing.id)
        .eq("tenant_id", tenant_id);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    } else {
      /* ===== INSERT ===== */
      const { error } = await supabase
        .from("system_branches")
        .insert({
          tenant_id,
          is_default: true,
          is_active: true,
          ...payload,
        });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    if (err.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Không thể lưu chi nhánh mặc định" },
      { status: 500 }
    );
  }
}
