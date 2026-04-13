// app/api/products/Brand/create/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
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

    const name = body?.name?.trim();

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

    /* ================= CHECK DUPLICATE ================= */
    const { data: existed } = await supabase
      .from("system_product_brands")
      .select("id")
      .eq("tenant_id", tenant_id)
      .ilike("name", name)
      .maybeSingle();

    if (existed) {
      return NextResponse.json(
        { error: "Nhãn hiệu đã tồn tại" },
        { status: 400 }
      );
    }

    /* ================= INSERT ================= */
    const { data, error } = await supabase
      .from("system_product_brands")
      .insert({
        name,
        tenant_id,
      })
      .select("id, name, created_at")
      .single();

    if (error) {
      // Bắt lỗi unique index nếu có
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Nhãn hiệu đã tồn tại" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
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

    console.error("Create brand error:", err);

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
