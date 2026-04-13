import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST – CREATE / GET DRAFT PRODUCT (IDEMPOTENT)

   ✔ Mỗi tenant chỉ có 1 draft active
   ✔ product_code dạng SP10000 tăng dần
====================================================== */
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);
    if (!tenant_id) {
      throw new Error("TENANT_NOT_FOUND");
    }

    /* ==================================================
       1️⃣ CHECK EXISTING DRAFT
    ================================================== */
    const { data: draft, error: draftErr } = await supabase
      .from("system_products")
      .select("id, name, status, product_code")
      .eq("tenant_id", tenant_id)
      .eq("status", "draft")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (draftErr) {
      return NextResponse.json(
        { error: "Không thể kiểm tra sản phẩm nháp" },
        { status: 500 }
      );
    }

    if (draft) {
      return NextResponse.json({
        success: true,
        product: draft,
      });
    }

    /* ==================================================
       2️⃣ LẤY PRODUCT_CODE LỚN NHẤT (FORMAT SPxxxxx)
    ================================================== */

    const { data: rows, error: maxErr } = await supabase
      .from("system_products")
      .select("product_code")
      .eq("tenant_id", tenant_id)
      .not("product_code", "is", null)
      .order("product_code", { ascending: false })
      .limit(50); // lấy 50 dòng để chắc chắn

    if (maxErr) {
      return NextResponse.json(
        { error: "Không thể lấy product_code lớn nhất" },
        { status: 500 }
      );
    }

   let maxNumber = 9999;

if (rows && rows.length > 0) {
  for (const row of rows) {
    const num = Number(row.product_code);
    if (num > maxNumber) {
      maxNumber = num;
    }
  }
}

const nextProductCode = maxNumber + 1;

    /* ==================================================
       3️⃣ CREATE NEW DRAFT
    ================================================== */

    const { data: created, error: createErr } =
      await supabase
        .from("system_products")
        .insert({
          tenant_id,
          name: "Sản phẩm mới",
          status: "draft",
          product_type: "normal",
          is_active: true,
          is_sell_online: true,
          product_code: nextProductCode,
        })
        .select("id, name, status, product_code")
        .single();

    if (createErr || !created) {
		console.error("CREATE DRAFT ERROR:", createErr);
      return NextResponse.json(
        {
          error:
            createErr?.message ||
            "Không thể tạo sản phẩm nháp",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: created,
    });
  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Đã xảy ra lỗi server",
      },
      { status: 500 }
    );
  }
}
