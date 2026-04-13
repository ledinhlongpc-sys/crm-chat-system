import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/finance/transaction-categories/create
====================================================== */

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= AUTH ================= */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    const body = await req.json();

    const category_name = body?.category_name?.trim();
    const category_type = body?.category_type; // income | expense

    /* ================= VALIDATE ================= */

    if (!category_name) {
      return NextResponse.json(
        { error: "Thiếu tên danh mục" },
        { status: 400 }
      );
    }

    if (!["income", "expense"].includes(category_type)) {
      return NextResponse.json(
        { error: "Loại danh mục không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= CHECK DUPLICATE ================= */

    const { data: existed } = await supabase
      .from("system_money_transaction_categories")
      .select("id")
      .eq("tenant_id", tenant_id)
      .ilike("category_name", category_name)
      .maybeSingle();

    if (existed) {
      return NextResponse.json(
        { error: "Danh mục đã tồn tại" },
        { status: 400 }
      );
    }

    /* ================= INSERT ================= */

    const { data, error } = await supabase
      .from("system_money_transaction_categories")
      .insert({
        tenant_id,
        category_name,
        category_type,
        is_active: true,
      })
      .select("id, category_name, category_type")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json(
      {
        success: true,
        category: data,
      },
      { status: 201 }
    );

  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}