//app/api/products/[id]/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getTenantId } from "@/lib/getTenantId";

const admin = createSupabaseAdmin();
const BUCKET = "product-images";

/* ======================================================
   DELETE – DELETE PRODUCT DRAFT ONLY
====================================================== */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* ================= PARAM ================= */
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "Thiếu productId" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= CHECK PRODUCT ================= */
    const { data: product, error } = await supabase
      .from("system_products")
      .select("id, status")
      .eq("id", productId)
      .eq("tenant_id", tenant_id)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    if (product.status !== "draft") {
      return NextResponse.json(
        { error: "Chỉ được xoá sản phẩm nháp" },
        { status: 400 }
      );
    }

    /* ================= DELETE PRODUCT DRAFT ================= */
    const { error: delErr, count } = await supabase
      .from("system_products")
      .delete({ count: "exact" })
      .eq("id", productId)
      .eq("tenant_id", tenant_id);

    if (delErr || !count) {
      return NextResponse.json(
        { error: "Không thể xoá sản phẩm nháp" },
        { status: 500 }
      );
    }

    /* ================= DELETE STORAGE =================
       Bao gồm:
       - ảnh sản phẩm
       - ảnh upload từ description
       (đều nằm dưới prefix product)
    =================================================== */

    const prefix = `${tenant_id}/products/${productId}`;

    await deleteAllFilesUnderPrefix(
      admin,
      BUCKET,
      prefix
    );

    return NextResponse.json({
      success: true,
      deleted_product_id: productId,
    });
  } catch (err: any) {
    console.error("DELETE product draft error:", err);

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

/* ======================================================
   HELPER – DELETE ALL FILES UNDER PREFIX
====================================================== */
async function deleteAllFilesUnderPrefix(
  admin: any,
  bucket: string,
  prefix: string
) {
  const files: string[] = [];

  async function walk(path: string) {
    const { data } = await admin.storage
      .from(bucket)
      .list(path, { limit: 1000 });

    if (!data) return;

    for (const item of data) {
      if (item.id) {
        files.push(`${path}/${item.name}`);
      } else {
        await walk(`${path}/${item.name}`);
      }
    }
  }

  await walk(prefix);

  if (files.length > 0) {
    await admin.storage.from(bucket).remove(files);
  }
}
