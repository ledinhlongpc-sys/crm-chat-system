import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   PUT /api/finance/categories/[id]/update
====================================================== */

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    /* ================= PARAM ================= */
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID danh mục" },
        { status: 400 }
      );
    }

    /* ================= BODY ================= */
    const body = await req.json();

    const category_name = body?.category_name?.trim();
    const category_type = body?.category_type;
    const is_active =
      typeof body?.is_active === "boolean"
        ? body.is_active
        : true;
    const note = body?.note ?? null;

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
      .eq("category_type", category_type)
      .ilike("category_name", category_name)
      .neq("id", id)
      .maybeSingle();

    if (existed) {
      return NextResponse.json(
        { error: "Danh mục đã tồn tại" },
        { status: 400 }
      );
    }

    /* ================= UPDATE ================= */

    const { data, error } = await supabase
      .from("system_money_transaction_categories")
      .update({
        category_name,
        category_type,
        is_active,
        note,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .select(
        "id, category_name, category_type, is_active, note"
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category: data,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}