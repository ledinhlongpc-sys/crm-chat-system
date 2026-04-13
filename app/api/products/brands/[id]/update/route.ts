// app/api/products/Brand/[id]/update/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  req: Request,
  { params }: Context
) {
  try {
    const { id } = await params; // ✅ FIX NEXT 15

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID nhãn hiệu" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    /* ===== TENANT CONTEXT ===== */
    const tenant_id = await getTenantId(supabase);

    /* ===== BODY ===== */
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
        { error: "Tên nhãn hiệu là bắt buộc" },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Tên nhãn hiệu quá ngắn" },
        { status: 400 }
      );
    }

    /* ===== UPDATE BRAND ===== */
    const { data, error } = await supabase
      .from("system_product_brands")
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
        { error: "Không tìm thấy nhãn hiệu hoặc không có quyền" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      brand: data,
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
