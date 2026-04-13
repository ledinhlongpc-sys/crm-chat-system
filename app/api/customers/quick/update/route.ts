import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   PUT /api/customers/quick/update
   - Cập nhật nhanh khách hàng (modal edit)
   - Không xử lý group mặc định ở đây
====================================================== */

export async function PUT(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const body = await req.json();

    const id = body?.id;
    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID khách hàng" },
        { status: 400 }
      );
    }

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

    const group_id = body?.group_id || null;
    const assigned_staff_id = body?.assigned_staff_id || null;

    if (!assigned_staff_id) {
      return NextResponse.json(
        { error: "Thiếu nhân viên phụ trách" },
        { status: 400 }
      );
    }

    /* ================= UPDATE CUSTOMER ================= */

    const { data, error } = await supabase
      .from("system_customers")
      .update({
        name,
        phone,
        email,
        group_id,
        assigned_staff_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .select(`
        id,
        customer_code,
        name,
        phone,
        email,
        group_id,
        assigned_staff_id
      `)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Cập nhật khách hàng thất bại" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });

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