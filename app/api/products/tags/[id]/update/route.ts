// app/api/products/tags/[id]/update/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";


export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
     const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID thẻ" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    /* ================= TENANT CONTEXT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    let body: { name?: string };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Body không hợp lệ" },
        { status: 400 }
      );
    }

    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Tên thẻ là bắt buộc" },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Tên thẻ quá ngắn" },
        { status: 400 }
      );
    }

    /* ================= CHECK DUPLICATE (PER TENANT) ================= */
    const { data: existed, error: checkErr } =
      await supabase
        .from("system_product_tags")
        .select("id")
        .eq("tenant_id", tenant_id)
        .ilike("name", name)
        .neq("id", id)
        .maybeSingle();

    if (checkErr) {
      return NextResponse.json(
        { error: checkErr.message },
        { status: 500 }
      );
    }

    if (existed) {
      return NextResponse.json(
        { error: "Tên thẻ đã tồn tại" },
        { status: 400 }
      );
    }

    /* ================= UPDATE ================= */
    const { data, error, count } = await supabase
      .from("system_product_tags")
      .update({ name })
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .select("id, name")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Không tìm thấy thẻ để cập nhật" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
    });
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
