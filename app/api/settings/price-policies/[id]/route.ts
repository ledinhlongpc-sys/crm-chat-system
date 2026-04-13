import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   PUT – UPDATE PRICE POLICY NAME
====================================================== */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: policyId } = await params;

    if (!policyId) {
      return NextResponse.json(
        { error: "Thiếu ID chính sách giá" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    const { name } = await req.json();
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Tên chính sách giá không hợp lệ" },
        { status: 400 }
      );
    }

    /* ===== LOAD POLICY ===== */
    const { data: policy, error: pErr } =
      await supabase
        .from("system_price_policies")
        .select("id, tenant_id, sort_order")
        .eq("id", policyId)
        .maybeSingle();

    if (pErr || !policy) {
      return NextResponse.json(
        { error: "Chính sách giá không tồn tại" },
        { status: 404 }
      );
    }

    /* ===== BUSINESS RULE ===== */
    if (policy.sort_order <= 3) {
      return NextResponse.json(
        { error: "Không thể sửa chính sách mặc định" },
        { status: 400 }
      );
    }

    /* ===== UPDATE ===== */
    const { error } = await supabase
      .from("system_price_policies")
      .update({
        ten_chinh_sach: name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", policyId)
      .eq("tenant_id", tenant_id);

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

    console.error("PUT price policy error:", err);
    return NextResponse.json(
      { error: "Có lỗi khi cập nhật chính sách giá" },
      { status: 500 }
    );
  }
}

/* ======================================================
   DELETE – DELETE PRICE POLICY
====================================================== */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: policyId } = await params;

    if (!policyId) {
      return NextResponse.json(
        { error: "Thiếu ID chính sách giá" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    /* ===== LOAD POLICY ===== */
    const { data: policy, error: pErr } =
      await supabase
        .from("system_price_policies")
        .select("id, tenant_id, sort_order")
        .eq("id", policyId)
        .maybeSingle();

    if (pErr || !policy) {
      return NextResponse.json(
        { error: "Chính sách giá không tồn tại" },
        { status: 404 }
      );
    }

    /* ===== BUSINESS RULE ===== */
    if (policy.sort_order <= 3) {
      return NextResponse.json(
        { error: "Không thể xoá chính sách mặc định" },
        { status: 400 }
      );
    }

    /* ===== DELETE ===== */
    const { error } = await supabase
      .from("system_price_policies")
      .delete()
      .eq("id", policyId)
      .eq("tenant_id", tenant_id);

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

    console.error("DELETE price policy error:", err);
    return NextResponse.json(
      { error: "Có lỗi khi xoá chính sách giá" },
      { status: 500 }
    );
  }
}
