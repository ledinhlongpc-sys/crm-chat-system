

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/* ======================================================
   GET /api/categories
   - Lấy danh sách danh mục sản phẩm theo tenant
====================================================== */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const { data, error } = await supabase
      .from("system_product_categories")
      .select("id, name, parent_id, sort_order, is_active, seo_slug")
      .eq("tenant_id", tenant_id)
      .order("parent_id", { ascending: true, nullsFirst: true })
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ categories: data ?? [] }, { status: 200 });
  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }
    console.error("GET categories error:", err);
    return NextResponse.json(
      { error: "Không tải được danh mục" },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST /api/categories
   - Tạo mới danh mục sản phẩm theo tenant
====================================================== */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const body = await req.json();
    const name = String(body?.name ?? "").trim();

    // parent_id: "" / undefined / null => null
    const rawParent = body?.parent_id;
    const parent_id =
      rawParent === "" || rawParent === undefined || rawParent === null
        ? null
        : String(rawParent);

    const is_active = Boolean(body?.is_active ?? true);

    // sort_order: user nhập thì dùng, không thì auto tăng
    const rawSort = body?.sort_order;
    const userSortOrder =
      rawSort === "" || rawSort === undefined || rawSort === null
        ? null
        : Number(rawSort);

    if (!name) {
      return NextResponse.json(
        { error: "Tên danh mục không được để trống" },
        { status: 400 }
      );
    }

    // Tính sort_order tự động nếu không nhập
    let nextSortOrder = 0;
    if (typeof userSortOrder === "number" && Number.isFinite(userSortOrder)) {
      nextSortOrder = userSortOrder;
    } else {
      const lastQuery = supabase
        .from("system_product_categories")
        .select("sort_order")
        .eq("tenant_id", tenant_id)
        .order("sort_order", { ascending: false })
        .limit(1);

      const { data: last, error: lastErr } = parent_id
        ? await lastQuery.eq("parent_id", parent_id).maybeSingle()
        : await lastQuery.is("parent_id", null).maybeSingle();

      if (lastErr) {
        console.warn("Get last sort_order warning:", lastErr);
        // fallback 0, không chặn tạo
      }

      nextSortOrder = (last?.sort_order ?? 0) + 1;
    }

    const seo_slug = slugify(name);

    const { data: created, error } = await supabase
      .from("system_product_categories")
      .insert({
        tenant_id,
        name,
        parent_id,
        sort_order: nextSortOrder,
        is_active,
        seo_slug,
      })
      .select("id, name, parent_id, sort_order, is_active, seo_slug")
      .single();

    if (error) {
      console.error("CREATE category error:", error);

      if (
        error.message?.includes("duplicate key") ||
        error.message?.includes("unique")
      ) {
        return NextResponse.json(
          { error: "Tên danh mục hoặc slug đã tồn tại" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Không thể tạo danh mục" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, category: created }, { status: 201 });
  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }
    console.error("POST categories error:", err);
    return NextResponse.json(
      { error: err?.message || "Không thể tạo danh mục" },
      { status: 500 }
    );
  }
}