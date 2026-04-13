import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        { error: "Thiếu ID danh mục" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, parent_id, sort_order, is_active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Tên danh mục không hợp lệ" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    /* ===== CHECK CATEGORY (THEO TENANT) ===== */
    const { data: category } = await supabase
      .from("system_product_categories")
      .select("id, tenant_id")
      .eq("id", categoryId)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (!category) {
      return NextResponse.json(
        { error: "Danh mục không tồn tại hoặc không có quyền" },
        { status: 404 }
      );
    }

    /* ❌ CHA = CHÍNH NÓ */
    if (parent_id === categoryId) {
      return NextResponse.json(
        { error: "Danh mục cha không hợp lệ" },
        { status: 400 }
      );
    }

    /* ===== UPDATE ===== */
    const { error } = await supabase
      .from("system_product_categories")
      .update({
        name: name.trim(),
        parent_id: parent_id || null,
        sort_order: Number.isFinite(Number(sort_order))
          ? Number(sort_order)
          : 0,
        is_active: Boolean(is_active),
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)
      .eq("tenant_id", tenant_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT CATEGORY ERROR:", err);
    return NextResponse.json(
      { error: "Có lỗi khi cập nhật danh mục" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        { error: "Thiếu ID danh mục" },
        { status: 400 }
      );
    }

    // phần còn lại giữ nguyên


    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    /* ===== CHECK CHILDREN ===== */
    const { count } = await supabase
      .from("system_product_categories")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant_id)
      .eq("parent_id", categoryId);

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "Không thể xoá danh mục cha khi còn danh mục con",
        },
        { status: 400 }
      );
    }

    /* ===== SOFT DELETE ===== */
    const { error } = await supabase
      .from("system_product_categories")
      .update({ is_active: false })
      .eq("id", categoryId)
      .eq("tenant_id", tenant_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err);
    return NextResponse.json(
      { error: "Không thể xoá danh mục" },
      { status: 500 }
    );
  }
}
