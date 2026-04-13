import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   GET – LOAD CHÍNH SÁCH GIÁ + GIÁ MẶC ĐỊNH
====================================================== */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    const [policiesRes, settingsRes] = await Promise.all([
      supabase
        .from("system_price_policies")
        .select(
          "id, ten_chinh_sach, ma_chinh_sach, loai_gia, sort_order"
        )
        .eq("tenant_id", tenant_id)
        .eq("is_active", true)
        .order("sort_order"),

      supabase
        .from("system_price_policy_settings")
        .select(
          "default_sale_price_id, default_purchase_price_id"
        )
        .eq("tenant_id", tenant_id)
        .maybeSingle(),
    ]);

    if (policiesRes.error) {
      throw policiesRes.error;
    }

    return NextResponse.json({
      options:
        policiesRes.data?.map((p) => ({
          id: p.id,
          name: p.ten_chinh_sach,
          code: p.ma_chinh_sach,
          type: p.loai_gia,
          sort_order: p.sort_order,
          is_system: p.sort_order <= 3,
        })) ?? [],

      default_sale_price_id:
        settingsRes.data?.default_sale_price_id ?? null,

      default_purchase_price_id:
        settingsRes.data?.default_purchase_price_id ?? null,
    });
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
      { error: "Không tải được chính sách giá" },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST – TẠO CHÍNH SÁCH GIÁ
====================================================== */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    const { name, code, type } = await req.json();

    if (!name || !code || !type) {
      return NextResponse.json(
        { error: "Thiếu thông tin chính sách giá" },
        { status: 400 }
      );
    }

    /* ===== lấy sort_order tiếp theo ===== */
    const { data: last } = await supabase
      .from("system_price_policies")
      .select("sort_order")
      .eq("tenant_id", tenant_id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSortOrder = (last?.sort_order ?? 3) + 1;

    const { error } = await supabase
      .from("system_price_policies")
      .insert({
        tenant_id,
        ten_chinh_sach: name,
        ma_chinh_sach: code,
        loai_gia: type,
        sort_order: nextSortOrder,
        is_active: true,
      });

    if (error) {
      if (
        error.message?.includes("uq_price_policy_code")
      ) {
        return NextResponse.json(
          { error: "Mã chính sách giá đã tồn tại" },
          { status: 409 }
        );
      }
      throw error;
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
      { error: "Không thể tạo chính sách giá" },
      { status: 500 }
    );
  }
}

/* ======================================================
   PUT – LƯU GIÁ MẶC ĐỊNH
====================================================== */
export async function PUT(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    const {
      default_sale_price_id,
      default_purchase_price_id,
    } = await req.json();

    const { error } = await supabase
      .from("system_price_policy_settings")
      .upsert(
        {
          tenant_id,
          default_sale_price_id,
          default_purchase_price_id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id" }
      );

    if (error) throw error;

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
      {
        error:
          "Không thể lưu cấu hình giá mặc định",
      },
      { status: 500 }
    );
  }
}
